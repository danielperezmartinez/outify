import { filterItems, ItemFilter } from './filter-items';
import { Item } from './models';
describe('Filtros de inventario', () => {
  const base: Item = {
    id: 1,
    user_id: 'u',
    name: 'Pantalón de lino',
    image_path: 'u/a.png',
    imageUrl: '',
    category: 'bottom',
    description: '',
    primary_color: 'Verde',
    brand: '',
    size_label: 'M',
    material: 'Lino',
    seasons: ['summer'],
    status: 'active',
    archived_at: null,
    created_at: '',
    updated_at: '',
    zoneId: 2,
    tags: ['Favorito'],
  };
  const filter: ItemFilter = {
    search: '',
    category: '',
    color: '',
    season: '',
    tag: '',
    wardrobe: '',
    assignment: '',
    status: 'active',
    zone: '',
  };
  it('busca ignorando tildes y mayúsculas', () => {
    expect(filterItems([base], { ...filter, search: 'PANTALON' }, [])).toHaveLength(1);
  });
  it('combina categoría, temporada, color, etiqueta y armario', () => {
    expect(
      filterItems(
        [base],
        {
          ...filter,
          category: 'bottom',
          season: 'summer',
          color: 'verde',
          tag: 'favorito',
          wardrobe: '3',
        },
        [{ id: 2, wardrobe_id: 3 }],
      ),
    ).toHaveLength(1);
    expect(filterItems([base], { ...filter, season: 'winter' }, [])).toHaveLength(0);
  });
  it('separa archivados y artículos sin ubicación', () => {
    expect(filterItems([base, { ...base, id: 2, status: 'archived' }], filter, [])).toHaveLength(1);
    expect(
      filterItems(
        [base, { ...base, id: 3, zoneId: null }],
        { ...filter, assignment: 'unassigned' },
        [],
      ).map((i) => i.id),
    ).toEqual([3]);
  });
});
