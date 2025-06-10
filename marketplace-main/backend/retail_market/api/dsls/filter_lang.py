from textx import metamodel_from_str

GRAMMAR = '''
FilterLangModel:
    expressions*=Expression
;

Expression:
    Operation | Conditional | Assignment | Unassignment | Copy
;

Operation:
    Require
;

Require:
    'require' key=Key
;

Copy:
    'copy' key1=Key 'fields[' key=Key ']'
;


Assignment:
    'set' key=Key '=' value=Value
;

Unassignment:
    'unset' key=Key
;

Conditional:
    TruthyConditional | EqualsConditional
;

TruthyConditional:
    'if' key=ID '{'
        expressions+=Expression
    '}'
;

EqualsConditional:
    'if' key=Key '==' value=Value '{'
        expressions+=Expression
    '}'
;

Key:
    key=/([a-zA-Z0-9_-])+(\[([a-zA-Z0-9_-]+)\])*/
;

Value:
    value=FromFields | value=BOOL | value=ID | value=STRING 
;

FromFields:
  'fields[' key=Key ']'
;
'''


class BaseExpression:
    def run(self):
        pass


class FilterLangModel(object):
    def __init__(self, **kwargs):
        self.expressions = kwargs.pop('expressions')

    def run(self, context):
        for expression in self.expressions:
            expression.run(context)


class Expression(BaseExpression):
    def __init__(self, **kwargs):
        self.expressions = kwargs.pop('expressions')

    def run(self, context):
        for expression in self.expressions:
            expression.run(context)


class Assignment(BaseExpression):
    def __init__(self, **kwargs):
        self.key = kwargs.pop('key')
        self.value = kwargs.pop('value')

    def is_assignment(self):
        return True

    def get_key(self):
        return self.key.key.strip()

    def is_from_fields(self):
        return type(self.value.value) is FromFields

    def get_value(self, context):
        if self.is_from_fields():
            return self.value.value.run(context)
        return self.value.value

    def run(self, context):
        key = self.get_key()
        if self.is_from_fields():
            copy_key = self.get_key()
            copied_key = self.value.value.get_key()
            old_val = context[copied_key]
            context[copy_key] = {
                'copied': copied_key,
                'value': old_val
            }
        else:
            value = self.get_value(context)
            if key in context:
                context[key] = value
            else:
                # do we need to create a type that we can use.
                context[key] = {
                    'new_value': BasicType(value)
                }


class BasicType():
    def __init__(self, value):
        self.value = value
        self.value_type = type(value)

    def as_dict(self):
        return {
            'type': self.value_type,
            'value': self.value
        }


class Unassignment(BaseExpression):
    def __init__(self, **kwargs):
        self.key = kwargs.pop('key')

    def get_key(self):
        key = self.key.key.strip()
        if 'fields[' in key:
            key = key[len('fields['):-1]
        return key

    def run(self, context):
        key = self.get_key()
        try:
            del context[key]
        except KeyError:
            pass


class EqualsConditional(BaseExpression):
    def __init__(self, **kwargs):
        self.key = kwargs.pop('key')
        self.value = kwargs.pop('value')
        self.expressions = kwargs.pop('expressions')

    def run(self, context):
        key = self.key.key.strip()
        if context.get(key) == self.value.value:
            for expression in self.expressions:
                expression.run(context)


class TruthyConditional(BaseExpression):
    def __init__(self, **kwargs):
        self.key = kwargs.pop('key')
        self.expressions = kwargs.pop('expressions')

    def run(self, context):
        key = self.key.strip()
        if key in context:
            for expression in self.expressions:
                expression.run(context)


class Operation(BaseExpression):
    def __init__(self, **kwargs):
        pass


class Require(BaseExpression):
    def __init__(self, **kwargs):
        self.key = kwargs.pop('key')

    def run(self, context):
        key = self.key.key.strip()
        if key in context:
            old_val = context[key]
            try:
                if context[key].get('new_value', False) or context[key].get('copied', False):
                    context[key]['required'] = True
            except AttributeError:
                context[key] = {'required': True, 'value': old_val}

class Copy(BaseExpression):
    def __init__(self, **kwargs):
        self.copy = kwargs.pop('key1')
        self.copied = kwargs.pop('key')

    def run(self, context):
        copy_key = self.copy.key.strip()
        copied_key = self.copied.key.strip()
        old_val = context[copied_key]
        context[copy_key] = {
            'copied': copied_key,
            'value': old_val
        }


class FromFields(BaseExpression):
    def __init__(self, **kwargs):
        self.key = kwargs.pop('key')

    def get_key(self):
        return self.key.key.strip()

    def run(self, context):
        key = self.get_key()
        return context[key]


def get_filter_lang(debug=False):
    filter_lang = metamodel_from_str(GRAMMAR,
                                     classes=[FilterLangModel, Expression,
                                              Assignment,
                                              Unassignment,
                                              EqualsConditional,
                                              TruthyConditional,
                                              Operation,
                                              Require,
                                              Copy,
                                              FromFields,
                                              ],
                                     debug=debug)
    return filter_lang
