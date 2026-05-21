using Microsoft.EntityFrameworkCore;
using MusicMarketplace.Models;

namespace MusicMarketplace.Services
{
    public class ClothingsService
    {
        private readonly MusicMarketplaceContext _context;
        public ClothingsService(MusicMarketplaceContext context) => _context = context;

        public class ClothingResponseDto
        {
            public int clothing_id { get; set; }
            public int product_id { get; set; }
            public string name { get; set; }
            public decimal price { get; set; }
            public string description { get; set; }
            public int stock { get; set; }
            public int manufacturer_id { get; set; }
            public string material { get; set; }
            public string color { get; set; }
            public string size { get; set; }
            public string gender { get; set; }
            public List<int> artistIds { get; set; }
            public string artistNames { get; set; }
        }

        public class ClothingCreateUpdateDto
        {
            public int clothing_id { get; set; }
            public string name { get; set; }
            public decimal price { get; set; }
            public string description { get; set; }
            public int stock { get; set; }
            public int manufacturer_id { get; set; }
            public string material { get; set; }
            public string color { get; set; }
            public string size { get; set; }
            public string gender { get; set; }
            public List<int> artistIds { get; set; }
        }

        public async Task<List<ClothingResponseDto>> GetAllAsync()
        {
            var items = await (from c in _context.Clothings
                               join m in _context.Merches on c.merch_id equals m.merch_id
                               join p in _context.Products on m.product_id equals p.product_id
                               select new ClothingResponseDto
                               {
                                   clothing_id = c.clothing_id,
                                   product_id = p.product_id,
                                   name = p.name,
                                   price = p.price,
                                   description = p.description,
                                   stock = p.stock,
                                   manufacturer_id = p.manufacturer_id,
                                   material = m.material,
                                   color = m.color,
                                   size = c.size,
                                   gender = c.gender
                               }).ToListAsync();

            foreach (var item in items)
            {
                var artistNamesList = await _context.ArtistMerches
                    .Where(am => am.merch_id == item.clothing_id)
                    .Join(_context.Artists,
                          am => am.artist_id,
                          a => a.artist_id,
                          (am, a) => a.name)
                    .ToListAsync();
                item.artistIds = await _context.ArtistMerches
                    .Where(am => am.merch_id == item.clothing_id)
                    .Select(am => am.artist_id)
                    .ToListAsync();
                item.artistNames = string.Join(", ", artistNamesList);
            }
            return items;
        }

        public async Task<ClothingResponseDto?> GetByIdAsync(int id)
        {
            var item = await (from c in _context.Clothings
                              join m in _context.Merches on c.merch_id equals m.merch_id
                              join p in _context.Products on m.product_id equals p.product_id
                              where c.clothing_id == id
                              select new ClothingResponseDto
                              {
                                  clothing_id = c.clothing_id,
                                  product_id = p.product_id,
                                  name = p.name,
                                  price = p.price,
                                  description = p.description,
                                  stock = p.stock,
                                  manufacturer_id = p.manufacturer_id,
                                  material = m.material,
                                  color = m.color,
                                  size = c.size,
                                  gender = c.gender
                              }).FirstOrDefaultAsync();

            if (item == null) return null;

            var artistNamesList = await _context.ArtistMerches
                .Where(am => am.merch_id == item.clothing_id)
                .Join(_context.Artists,
                      am => am.artist_id,
                      a => a.artist_id,
                      (am, a) => a.name)
                .ToListAsync();
            item.artistIds = await _context.ArtistMerches
                .Where(am => am.merch_id == item.clothing_id)
                .Select(am => am.artist_id)
                .ToListAsync();
            item.artistNames = string.Join(", ", artistNamesList);
            return item;
        }

        public async Task<ClothingResponseDto> CreateAsync(ClothingCreateUpdateDto dto)
        {
            using var tx = await _context.Database.BeginTransactionAsync();
            try
            {
                var product = new Product
                {
                    name = dto.name,
                    price = dto.price,
                    description = dto.description,
                    stock = dto.stock,
                    manufacturer_id = dto.manufacturer_id
                };
                _context.Products.Add(product);
                await _context.SaveChangesAsync();

                var merch = new Merch
                {
                    product_id = product.product_id,
                    material = dto.material,
                    color = dto.color
                };
                _context.Merches.Add(merch);
                await _context.SaveChangesAsync();

                var clothing = new Clothing
                {
                    merch_id = merch.merch_id,
                    size = dto.size,
                    gender = dto.gender
                };
                _context.Clothings.Add(clothing);
                await _context.SaveChangesAsync();

                if (dto.artistIds != null && dto.artistIds.Any())
                {
                    foreach (var artistId in dto.artistIds)
                    {
                        _context.ArtistMerches.Add(new ArtistMerch { artist_id = artistId, merch_id = merch.merch_id });
                    }
                    await _context.SaveChangesAsync();
                }

                await tx.CommitAsync();

                return new ClothingResponseDto
                {
                    clothing_id = clothing.clothing_id,
                    product_id = product.product_id,
                    name = dto.name,
                    price = dto.price,
                    description = dto.description,
                    stock = dto.stock,
                    manufacturer_id = dto.manufacturer_id,
                    material = dto.material,
                    color = dto.color,
                    size = dto.size,
                    gender = dto.gender,
                    artistIds = dto.artistIds ?? new List<int>()
                };
            }
            catch
            {
                await tx.RollbackAsync();
                throw;
            }
        }

        public async Task UpdateAsync(int id, ClothingCreateUpdateDto dto)
        {
            if (id != dto.clothing_id) throw new ArgumentException("ID mismatch");

            using var tx = await _context.Database.BeginTransactionAsync();
            try
            {
                var clothing = await _context.Clothings.FindAsync(id);
                if (clothing == null) throw new KeyNotFoundException($"Clothing with id {id} not found");

                var merch = await _context.Merches.FindAsync(clothing.merch_id);
                if (merch == null) throw new KeyNotFoundException($"Merch for clothing {id} not found");

                var product = await _context.Products.FindAsync(merch.product_id);
                if (product == null) throw new KeyNotFoundException($"Product for clothing {id} not found");

                product.name = dto.name;
                product.price = dto.price;
                product.description = dto.description;
                product.stock = dto.stock;
                product.manufacturer_id = dto.manufacturer_id;

                merch.material = dto.material;
                merch.color = dto.color;

                clothing.size = dto.size;
                clothing.gender = dto.gender;

                var oldLinks = await _context.ArtistMerches.Where(am => am.merch_id == merch.merch_id).ToListAsync();
                _context.ArtistMerches.RemoveRange(oldLinks);

                if (dto.artistIds != null && dto.artistIds.Any())
                {
                    foreach (var artistId in dto.artistIds)
                    {
                        _context.ArtistMerches.Add(new ArtistMerch { artist_id = artistId, merch_id = merch.merch_id });
                    }
                }

                await _context.SaveChangesAsync();
                await tx.CommitAsync();
            }
            catch
            {
                await tx.RollbackAsync();
                throw;
            }
        }

        public async Task DeleteAsync(int id)
        {
            var clothing = await _context.Clothings.FindAsync(id);
            if (clothing == null) throw new KeyNotFoundException($"Clothing with id {id} not found");

            var merch = await _context.Merches.FindAsync(clothing.merch_id);
            var product = merch != null ? await _context.Products.FindAsync(merch.product_id) : null;

            _context.Clothings.Remove(clothing);
            if (merch != null) _context.Merches.Remove(merch);
            if (product != null) _context.Products.Remove(product);
            await _context.SaveChangesAsync();
        }
    }
}