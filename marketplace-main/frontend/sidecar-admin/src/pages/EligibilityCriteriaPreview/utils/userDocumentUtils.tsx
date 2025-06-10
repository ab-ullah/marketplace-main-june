export const canViewUserDocumentsBlock = (isEligible: boolean, filesText: any) => {
  if (!isEligible) return false;
  return Object.values(filesText).some(text => !!text)
}
