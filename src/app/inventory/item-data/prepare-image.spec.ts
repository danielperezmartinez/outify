import { fitWithin, MAX_IMAGE_SIDE, prepareImage } from './prepare-image';
describe('Preparación de fotos', () => {
  it('reduce el lado mayor a 1600 px y conserva la proporción', () => {
    expect(fitWithin(4000, 3000)).toEqual({ width: MAX_IMAGE_SIDE, height: 1200 });
    expect(fitWithin(3000, 6000)).toEqual({ width: 800, height: MAX_IMAGE_SIDE });
  });
  it('no amplía fotos pequeñas', () => {
    expect(fitWithin(640, 480)).toEqual({ width: 640, height: 480 });
  });
  it('devuelve el original si el navegador no puede decodificarlo', async () => {
    const original = new File(['x'], 'foto.png', { type: 'image/png' });
    expect(await prepareImage(original)).toBe(original);
  });
});
