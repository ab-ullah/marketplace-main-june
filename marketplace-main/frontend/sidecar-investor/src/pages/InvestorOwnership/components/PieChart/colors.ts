const colorRange = ["#AD62AA", "#4A47A3", "#610094", "#03145E"];

export const getColor = (index: number) => {
  return colorRange[index % colorRange.length]
}


