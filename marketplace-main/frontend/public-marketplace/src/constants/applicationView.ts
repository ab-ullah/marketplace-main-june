import replace from "lodash/replace";

const titleTag = '<section_title>';

export const unavailableSection = `${titleTag} will appear later.`;

export const getUnavailableSectionMesage = (title: string) => 
  replace(unavailableSection, titleTag, title);
