export const reorderOptions = (options: never[]) => {
    const reordered_options = [...options]
    // move option with logical_value with to end of array
    reordered_options.push(reordered_options.splice(reordered_options.findIndex((option: { logical_value: boolean; }) => option.logical_value == false), 1)[0])
    return reordered_options
}