"""
Custom Manager for the User
"""
from django.contrib.auth.base_user import BaseUserManager


class UserManager(BaseUserManager):
    def get_queryset(self):
        return super().get_queryset().filter(deleted=False)

    def create_user(self, username, password=None):
        """
        Creates and saves a User with the given username and password.
        """
        if not username:
            raise ValueError('Users must have an username')

        user = self.model(username=username)

        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_staffuser(self, username, password):
        """
        Creates and saves a staff user with the given email and password.
        """
        user = self.create_user(
            username=username,
            password=password,
        )
        user.is_staff = True
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password):
        """
        Creates and saves a superuser with the given email and password.
        """
        user = self.create_user(
            username=username,
            password=password,
        )
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user
