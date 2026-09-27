export function normalizePlate(input: string): string {
  const plate = input
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  if (
    !/^[A-Z0-9]{5,8}$/.test(plate) ||
    !/[A-Z]/.test(plate) ||
    !/[0-9]/.test(plate)
  )
    throw new Error("Ingresa una placa válida de 5 a 8 caracteres.");
  return plate;
}
