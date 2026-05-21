using Microsoft.EntityFrameworkCore;
using MusicMarketplace.DTOs;
using MusicMarketplace.Models;

namespace MusicMarketplace.Services
{
    public class ProductsService
    {
        private readonly MusicMarketplaceContext _context;
        public ProductsService(MusicMarketplaceContext context) => _context = context;

        public async Task<List<Product>> GetAllAsync()
        {
            return await _context.Products.ToListAsync();
        }

        public async Task<Product?> GetByIdAsync(int id)
        {
            return await _context.Products.FindAsync(id);
        }

        public async Task<Product> CreateAsync(ProductDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.name))
                throw new ArgumentException("Название товара обязательно");
            if (dto.manufacturer_id == 0)
                throw new ArgumentException("Производитель обязателен");
            if (await _context.Products.AnyAsync(p => p.name == dto.name))
                throw new InvalidOperationException("Товар с таким названием уже существует");

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
            return product;
        }

        public async Task UpdateAsync(int id, ProductDto dto)
        {
            if (id != dto.product_id) throw new ArgumentException("ID mismatch");
            if (string.IsNullOrWhiteSpace(dto.name))
                throw new ArgumentException("Название товара обязательно");
            if (dto.manufacturer_id == 0)
                throw new ArgumentException("Производитель обязателен");

            var product = await _context.Products.FindAsync(id);
            if (product == null) throw new KeyNotFoundException($"Product with id {id} not found");

            if (await _context.Products.AnyAsync(p => p.name == dto.name && p.product_id != id))
                throw new InvalidOperationException("Товар с таким названием уже существует");

            product.name = dto.name;
            product.price = dto.price;
            product.description = dto.description;
            product.stock = dto.stock;
            product.manufacturer_id = dto.manufacturer_id;

            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) throw new KeyNotFoundException($"Product with id {id} not found");
            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
        }

        public async Task<List<object>> GetFilteredAsync(
            string? searchName, string? type, int? manufacturerId, int? artistId,
            bool inStock, decimal? priceMin, decimal? priceMax, string? sortBy, string? selectedGenres)
        {
            var ticketsQuery = _context.Tickets
                .Include(t => t.concert)
                .Include(t => t.product)
                .Select(t => new
                {
                    ticket_id = t.ticket_id,
                    product_id = t.product_id,
                    name = t.product.name,
                    price = t.product.price,
                    description = t.product.description,
                    stock = t.product.stock,
                    manufacturer_id = t.product.manufacturer_id,
                    type = "ticket",
                    typeName = "Билет",
                    concert_id = t.concert_id,
                    concert_title = t.concert.title,
                    price_category = t.price_category,
                    quantity = t.quantity
                });

            var clothingsQuery = _context.Clothings
                .Include(c => c.Merch)
                .ThenInclude(m => m.Product)
                .Select(c => new
                {
                    clothing_id = c.clothing_id,
                    product_id = c.Merch.Product.product_id,
                    name = c.Merch.Product.name,
                    price = c.Merch.Product.price,
                    description = c.Merch.Product.description,
                    stock = c.Merch.Product.stock,
                    manufacturer_id = c.Merch.Product.manufacturer_id,
                    type = "clothing",
                    typeName = "Одежда",
                    material = c.Merch.material,
                    color = c.Merch.color,
                    size = c.size,
                    gender = c.gender,
                    artistIds = _context.ArtistMerches
                        .Where(am => am.merch_id == c.merch_id)
                        .Select(am => am.artist_id)
                        .ToList(),
                    artistNames = _context.ArtistMerches
                        .Where(am => am.merch_id == c.merch_id)
                        .Join(_context.Artists,
                              am => am.artist_id,
                              a => a.artist_id,
                              (am, a) => a.name)
                        .ToList()
                });

            var accessoriesQuery = _context.Accessories
                .Include(a => a.Merch)
                .ThenInclude(m => m.Product)
                .Select(a => new
                {
                    accessory_id = a.accessory_id,
                    product_id = a.Merch.Product.product_id,
                    name = a.Merch.Product.name,
                    price = a.Merch.Product.price,
                    description = a.Merch.Product.description,
                    stock = a.Merch.Product.stock,
                    manufacturer_id = a.Merch.Product.manufacturer_id,
                    type = "accessory",
                    typeName = "Аксессуар",
                    material = a.Merch.material,
                    color = a.Merch.color,
                    accessory_type = a.accessory_type,
                    weight = a.weight,
                    artistIds = _context.ArtistMerches
                        .Where(am => am.merch_id == a.merch_id)
                        .Select(am => am.artist_id)
                        .ToList(),
                    artistNames = _context.ArtistMerches
                        .Where(am => am.merch_id == a.merch_id)
                        .Join(_context.Artists,
                              am => am.artist_id,
                              a => a.artist_id,
                              (am, a) => a.name)
                        .ToList()
                });

            if (!string.IsNullOrEmpty(searchName))
            {
                ticketsQuery = ticketsQuery.Where(t => t.name.ToLower().Contains(searchName.ToLower()));
                clothingsQuery = clothingsQuery.Where(c => c.name.ToLower().Contains(searchName.ToLower()));
                accessoriesQuery = accessoriesQuery.Where(a => a.name.ToLower().Contains(searchName.ToLower()));
            }

            if (manufacturerId.HasValue)
            {
                ticketsQuery = ticketsQuery.Where(t => t.manufacturer_id == manufacturerId.Value);
                clothingsQuery = clothingsQuery.Where(c => c.manufacturer_id == manufacturerId.Value);
                accessoriesQuery = accessoriesQuery.Where(a => a.manufacturer_id == manufacturerId.Value);
            }

            if (inStock)
            {
                ticketsQuery = ticketsQuery.Where(t => t.stock > 0);
                clothingsQuery = clothingsQuery.Where(c => c.stock > 0);
                accessoriesQuery = accessoriesQuery.Where(a => a.stock > 0);
            }

            if (priceMin.HasValue)
            {
                ticketsQuery = ticketsQuery.Where(t => t.price >= priceMin.Value);
                clothingsQuery = clothingsQuery.Where(c => c.price >= priceMin.Value);
                accessoriesQuery = accessoriesQuery.Where(a => a.price >= priceMin.Value);
            }

            if (priceMax.HasValue)
            {
                ticketsQuery = ticketsQuery.Where(t => t.price <= priceMax.Value);
                clothingsQuery = clothingsQuery.Where(c => c.price <= priceMax.Value);
                accessoriesQuery = accessoriesQuery.Where(a => a.price <= priceMax.Value);
            }

            List<int> productIdsWithArtist = null;
            if (artistId.HasValue)
            {
                productIdsWithArtist = await _context.ArtistMerches
                    .Where(am => am.artist_id == artistId.Value)
                    .Join(_context.Merches,
                          am => am.merch_id,
                          m => m.merch_id,
                          (am, m) => m.product_id)
                    .ToListAsync();
                ticketsQuery = ticketsQuery.Where(t => productIdsWithArtist.Contains(t.product_id));
                clothingsQuery = clothingsQuery.Where(c => productIdsWithArtist.Contains(c.product_id));
                accessoriesQuery = accessoriesQuery.Where(a => productIdsWithArtist.Contains(a.product_id));
            }

            List<int> productIdsWithGenre = null;
            if (!string.IsNullOrEmpty(selectedGenres))
            {
                var genreIds = selectedGenres.Split(',').Select(int.Parse).ToList();
                productIdsWithGenre = await _context.ProductGenres
                    .Where(pg => genreIds.Contains(pg.genre_id))
                    .Select(pg => pg.product_id)
                    .ToListAsync();
                ticketsQuery = ticketsQuery.Where(t => productIdsWithGenre.Contains(t.product_id));
                clothingsQuery = clothingsQuery.Where(c => productIdsWithGenre.Contains(c.product_id));
                accessoriesQuery = accessoriesQuery.Where(a => productIdsWithGenre.Contains(a.product_id));
            }

            var tickets = await ticketsQuery.ToListAsync();
            var clothings = await clothingsQuery.ToListAsync();
            var accessories = await accessoriesQuery.ToListAsync();

            var result = new List<object>();
            if (string.IsNullOrEmpty(type) || type == "ticket")
                result.AddRange(tickets);
            if (string.IsNullOrEmpty(type) || type == "clothing")
                result.AddRange(clothings);
            if (string.IsNullOrEmpty(type) || type == "accessory")
                result.AddRange(accessories);

            result = sortBy switch
            {
                "price_asc" => result.OrderBy(p => (decimal)p.GetType().GetProperty("price")?.GetValue(p)).ToList(),
                "price_desc" => result.OrderByDescending(p => (decimal)p.GetType().GetProperty("price")?.GetValue(p)).ToList(),
                "stock_asc" => result.OrderBy(p => (int)p.GetType().GetProperty("stock")?.GetValue(p)).ToList(),
                "stock_desc" => result.OrderByDescending(p => (int)p.GetType().GetProperty("stock")?.GetValue(p)).ToList(),
                _ => result
            };

            return result;
        }

        public async Task<List<string>> GetNamesAsync()
        {
            return await _context.Products.Select(p => p.name).ToListAsync();
        }
    }
}