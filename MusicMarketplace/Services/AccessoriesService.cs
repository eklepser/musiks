// AccessoriesService.cs
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using MusicMarketplace.DTOs;
using MusicMarketplace.Models;

namespace MusicMarketplace.Services
{
    public class AccessoriesService
    {
        private readonly MusicMarketplaceContext _context;
        public AccessoriesService(MusicMarketplaceContext context) => _context = context;

        public async Task<List<AccessoryResponseDto>> GetAllAsync()
        {
            var sql = "SELECT * FROM get_all_accessories()";
            return await _context.Database.SqlQueryRaw<AccessoryResponseDto>(sql).ToListAsync();
        }

        public async Task<AccessoryResponseDto?> GetByIdAsync(int id)
        {
            var sql = "SELECT * FROM get_accessory_by_id({0})";
            return await _context.Database.SqlQueryRaw<AccessoryResponseDto>(sql, id).FirstOrDefaultAsync();
        }

        public async Task<AccessoryResponseDto> CreateAsync(AccessoryCreateUpdateDto dto)
        {
            var json = JsonSerializer.Serialize(dto.artistIds ?? new List<int>());
            var sql = "SELECT * FROM create_accessory({0}, {1}, {2}, {3}, {4}, {5}, {6}, {7}, {8}, {9})";
            return await _context.Database.SqlQueryRaw<AccessoryResponseDto>(
                sql,
                dto.name,
                dto.price,
                dto.description ?? (object)DBNull.Value,
                dto.stock,
                dto.manufacturer_id,
                dto.material ?? (object)DBNull.Value,
                dto.color ?? (object)DBNull.Value,
                dto.accessory_type ?? (object)DBNull.Value,
                dto.weight ?? (object)DBNull.Value,
                json
            ).FirstOrDefaultAsync();
        }

        public async Task<bool> UpdateAsync(int id, AccessoryCreateUpdateDto dto)
        {
            var json = JsonSerializer.Serialize(dto.artistIds ?? new List<int>());
            var sql = "SELECT update_accessory({0}, {1}, {2}, {3}, {4}, {5}, {6}, {7}, {8}, {9}, {10})";
            var result = await _context.Database.ExecuteSqlRawAsync(
                sql,
                id,
                dto.name,
                dto.price,
                dto.description ?? (object)DBNull.Value,
                dto.stock,
                dto.manufacturer_id,
                dto.material ?? (object)DBNull.Value,
                dto.color ?? (object)DBNull.Value,
                dto.accessory_type ?? (object)DBNull.Value,
                dto.weight ?? (object)DBNull.Value,
                json
            );
            return result > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var accessory = await _context.Accessories
                .Include(a => a.Merch)
                .ThenInclude(m => m.Product)
                .FirstOrDefaultAsync(a => a.accessory_id == id);
            if (accessory == null)
                throw new KeyNotFoundException($"Аксессуар с ID {id} не найден");
            var productId = accessory.Merch.Product.product_id;
            var hasOrders = await _context.OrderItems.AnyAsync(oi => oi.product_id == productId);
            if (hasOrders)
                throw new InvalidOperationException("Нельзя удалить товар, который есть в заказах");
            var sql = "SELECT delete_accessory({0})";
            var result = await _context.Database.ExecuteSqlRawAsync(sql, id);
            return result > 0;
        }
    }
}