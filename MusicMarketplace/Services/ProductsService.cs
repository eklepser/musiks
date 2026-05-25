using System.Text.Json;
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
            var sql = "SELECT * FROM get_all_products()";
            return await _context.Set<Product>().FromSqlRaw(sql).ToListAsync();
        }

        public async Task<Product?> GetByIdAsync(int id)
        {
            var sql = "SELECT * FROM get_product_by_id({0})";
            return await _context.Set<Product>().FromSqlRaw(sql, id).FirstOrDefaultAsync();
        }

        public async Task<Product> CreateAsync(ProductDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.name))
                throw new ArgumentException("Название товара обязательно");
            if (dto.price <= 0)
                throw new ArgumentException("Цена должна быть больше нуля");
            if (dto.manufacturer_id <= 0)
                throw new ArgumentException("Производитель обязателен");
            if (dto.stock < 0)
                throw new ArgumentException("Остаток не может быть отрицательным");

            var exists = await _context.Products.AnyAsync(p => p.name == dto.name.Trim());
            if (exists)
                throw new InvalidOperationException($"Товар с названием '{dto.name}' уже существует");

            var sql = "SELECT * FROM create_product({0}, {1}, {2}, {3}, {4})";
            var result = await _context.Set<Product>().FromSqlRaw(
                sql,
                dto.name.Trim(),
                dto.price,
                string.IsNullOrWhiteSpace(dto.description) ? null : dto.description.Trim(),
                dto.stock,
                dto.manufacturer_id
            ).FirstOrDefaultAsync();

            return result;
        }

        public async Task<bool> UpdateAsync(int id, ProductDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.name))
                throw new ArgumentException("Название товара обязательно");
            if (dto.price <= 0)
                throw new ArgumentException("Цена должна быть больше нуля");
            if (dto.manufacturer_id <= 0)
                throw new ArgumentException("Производитель обязателен");
            if (dto.stock < 0)
                throw new ArgumentException("Остаток не может быть отрицательным");

            var existing = await _context.Products.FindAsync(id);
            if (existing == null)
                throw new KeyNotFoundException($"Товар с ID {id} не найден");

            var conflict = await _context.Products.AnyAsync(p => p.name == dto.name.Trim() && p.product_id != id);
            if (conflict)
                throw new InvalidOperationException($"Товар с названием '{dto.name}' уже существует");

            var sql = "SELECT update_product({0}, {1}, {2}, {3}, {4}, {5})";
            var result = await _context.Database.ExecuteSqlRawAsync(
                sql,
                id,
                dto.name.Trim(),
                dto.price,
                string.IsNullOrWhiteSpace(dto.description) ? null : dto.description.Trim(),
                dto.stock,
                dto.manufacturer_id
            );

            return result > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                throw new KeyNotFoundException($"Товар с ID {id} не найден");

            var hasOrderItems = await _context.OrderItems.AnyAsync(oi => oi.product_id == id);
            if (hasOrderItems)
                throw new InvalidOperationException("Нельзя удалить товар, который есть в заказах");

            var sql = "SELECT delete_product({0})";
            var result = await _context.Database.ExecuteSqlRawAsync(sql, id);
            return result > 0;
        }

        public async Task<List<object>> GetFilteredAsync(
            string? searchName, string? type, int? manufacturerId, int? artistId,
            bool inStock, decimal? priceMin, decimal? priceMax, string? sortBy, string? selectedGenres)
        {
            var result = new List<object>();

            if (string.IsNullOrEmpty(type) || type == "ticket")
                result.AddRange(await GetFilteredTicketsAsync(searchName, manufacturerId, artistId, inStock, priceMin, priceMax, selectedGenres));

            if (string.IsNullOrEmpty(type) || type == "clothing")
                result.AddRange(await GetFilteredClothingsAsync(searchName, manufacturerId, artistId, inStock, priceMin, priceMax, selectedGenres));

            if (string.IsNullOrEmpty(type) || type == "accessory")
                result.AddRange(await GetFilteredAccessoriesAsync(searchName, manufacturerId, artistId, inStock, priceMin, priceMax, selectedGenres));

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

        private async Task<List<TicketFilterResult>> GetFilteredTicketsAsync(
            string? searchName, int? manufacturerId, int? artistId, bool inStock,
            decimal? priceMin, decimal? priceMax, string? selectedGenres)
        {
            var sql = "SELECT * FROM get_filtered_tickets({0}, {1}, {2}, {3}, {4}, {5}, {6})";
            return await _context.Database.SqlQueryRaw<TicketFilterResult>(
                sql,
                searchName,
                manufacturerId,
                artistId,
                inStock,
                priceMin,
                priceMax,
                selectedGenres
            ).ToListAsync();
        }

        private async Task<List<ClothingFilterResult>> GetFilteredClothingsAsync(
            string? searchName, int? manufacturerId, int? artistId, bool inStock,
            decimal? priceMin, decimal? priceMax, string? selectedGenres)
        {
            var sql = "SELECT * FROM get_filtered_clothings({0}, {1}, {2}, {3}, {4}, {5}, {6})";
            return await _context.Database.SqlQueryRaw<ClothingFilterResult>(
                sql,
                searchName,
                manufacturerId,
                artistId,
                inStock,
                priceMin,
                priceMax,
                selectedGenres 
            ).ToListAsync();
        }

        private async Task<List<AccessoryFilterResult>> GetFilteredAccessoriesAsync(
            string? searchName, int? manufacturerId, int? artistId, bool inStock,
            decimal? priceMin, decimal? priceMax, string? selectedGenres)
        {
            var sql = "SELECT * FROM get_filtered_accessories({0}, {1}, {2}, {3}, {4}, {5}, {6})";
            return await _context.Database.SqlQueryRaw<AccessoryFilterResult>(
                sql,
                searchName,
                manufacturerId,
                artistId,
                inStock,
                priceMin,
                priceMax,
                selectedGenres
            ).ToListAsync();
        }

        public async Task<List<string>> GetNamesAsync()
        {
            var sql = "SELECT * FROM get_product_names()";
            var result = await _context.Database.SqlQueryRaw<NameResult>(sql).ToListAsync();
            return result.Select(r => r.name).ToList();
        }

        private class NameResult { public string name { get; set; } }
    }

    public class TicketFilterResult
    {
        public int ticket_id { get; set; }
        public int product_id { get; set; }
        public string name { get; set; }
        public decimal price { get; set; }
        public string? description { get; set; }
        public int stock { get; set; }
        public int manufacturer_id { get; set; }
        public string type { get; set; }
        public string typeName { get; set; }
        public int concert_id { get; set; }
        public string? concert_title { get; set; }
        public string? price_category { get; set; }
        public string? artistNames { get; set; }
        public string? artistIds { get; set; }
    }

    public class ClothingFilterResult
    {
        public int clothing_id { get; set; }
        public int product_id { get; set; }
        public string name { get; set; }
        public decimal price { get; set; }
        public string? description { get; set; }
        public int stock { get; set; }
        public int manufacturer_id { get; set; }
        public string type { get; set; }
        public string typeName { get; set; }
        public string? material { get; set; }
        public string? color { get; set; }
        public string? size { get; set; }
        public string? gender { get; set; }
        public string? artistNames { get; set; }
        public string? artistIds { get; set; }
    }

    public class AccessoryFilterResult
    {
        public int accessory_id { get; set; }
        public int product_id { get; set; }
        public string name { get; set; }
        public decimal price { get; set; }
        public string? description { get; set; }
        public int stock { get; set; }
        public int manufacturer_id { get; set; }
        public string type { get; set; }
        public string typeName { get; set; }
        public string? material { get; set; }
        public string? color { get; set; }
        public string? accessory_type { get; set; }
        public decimal? weight { get; set; }
        public string? artistNames { get; set; }
        public string? artistIds { get; set; }
    }
}