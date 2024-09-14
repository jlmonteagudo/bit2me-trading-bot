let productionSettings;
let simulationSettings;

export const setSettings = (settings, isSimulation) => {
  if (isSimulation) return simulationSettings = settings;
  productionSettings = settings;
}

export const getSettings = (isSimulation) => {
  if (isSimulation) return simulationSettings;
  return productionSettings;
}
