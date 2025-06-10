export const DEFAULT_NEXT_BLOCK_ID = 'default_next_block';
export const DEFAULT_COUNTRY_SELECTOR_BLOCK: string = 'country_selector'
export const DEFAULT_FINAL_BLOCK: string = 'final_block'
export const DEFAULT_DOC_BLOCK: string = 'document_block'
export const DEFAULT_BLOCKS = [DEFAULT_COUNTRY_SELECTOR_BLOCK, DEFAULT_FINAL_BLOCK]
export const DEFAULT_BLOCKS_LABELS = {
    [DEFAULT_FINAL_BLOCK]: 'Final Block',
    [DEFAULT_COUNTRY_SELECTOR_BLOCK]: 'Country Selector',
    [DEFAULT_DOC_BLOCK]: 'Supporting Documents'
}
export const getDefaultDocumentBlock = (position: { x: any; y: any; }) => {
    const {x, y} = position;
    return {
        id: DEFAULT_DOC_BLOCK,
        data: {
          label: DEFAULT_BLOCKS_LABELS[DEFAULT_DOC_BLOCK]
        },
        position: {x, y: y - 100},
        className: "light",
        style: {
          backgroundColor: "rgba(255, 0, 0, 0.2)",
          width: 200,
          height: 50,
        },
      }
}