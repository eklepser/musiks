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
            var artistsJson = JsonSerializer.Serialize(dto.artistIds ?? new List<int>());
            var genresJson = JsonSerializer.Serialize(dto.genreIds ?? new List<int>());
            var sql = "SELECT * FROM create_accessory({0}, {1}, {2}, {3}, {4}, {5}, {6}, {7}, {8}, {9}, {10})";
            return await _context.Database.SqlQueryRaw<AccessoryResponseDto>(
                sql,
                dto.name,
                dto.price,
                dto.description,
                dto.stock,
                dto.manufacturer_id,
                dto.material,
                dto.color,
                dto.accessory_type,
                dto.weight,
                artistsJson,
                genresJson
            ).FirstOrDefaultAsync();
        }

        public async Task<bool> UpdateAsync(int id, AccessoryCreateUpdateDto dto)
        {
            var artistsJson = JsonSerializer.Serialize(dto.artistIds ?? new List<int>());
            var genresJson = JsonSerializer.Serialize(dto.genreIds ?? new List<int>());
            var sql = "SELECT update_accessory({0}, {1}, {2}, {3}, {4}, {5}, {6}, {7}, {8}, {9}, {10}, {11})";
            var result = await _context.Database.ExecuteSqlRawAsync(
                sql,
                id,
                dto.name,
                dto.price,
                dto.description,
                dto.stock,
                dto.manufacturer_id,
                dto.material,
                dto.color,
                dto.accessory_type,
                dto.weight,
                artistsJson,
                genresJson
            );
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var sql = "SELECT delete_accessory({0})";
            var result = await _context.Database.ExecuteSqlRawAsync(sql, id);
            return result > 0;
        }
    }
}