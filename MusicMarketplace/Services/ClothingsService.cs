using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using MusicMarketplace.DTOs;
using MusicMarketplace.Models;

namespace MusicMarketplace.Services
{
    public class ClothingsService
    {
        private readonly MusicMarketplaceContext _context;
        public ClothingsService(MusicMarketplaceContext context) => _context = context;

        public async Task<List<ClothingResponseDto>> GetAllAsync()
        {
            var sql = "SELECT * FROM get_all_clothings()";
            return await _context.Database.SqlQueryRaw<ClothingResponseDto>(sql).ToListAsync();
        }

        public async Task<ClothingResponseDto?> GetByIdAsync(int id)
        {
            var sql = "SELECT * FROM get_clothing_by_id({0})";
            return await _context.Database.SqlQueryRaw<ClothingResponseDto>(sql, id).FirstOrDefaultAsync();
        }

        public async Task<ClothingResponseDto> CreateAsync(ClothingCreateUpdateDto dto)
        {
            var artistsJson = JsonSerializer.Serialize(dto.artistIds ?? new List<int>());
            var genresJson = JsonSerializer.Serialize(dto.genreIds ?? new List<int>());
            var sql = "SELECT * FROM create_clothing({0}, {1}, {2}, {3}, {4}, {5}, {6}, {7}, {8}, {9}, {10})";
            return await _context.Database.SqlQueryRaw<ClothingResponseDto>(
                sql,
                dto.name,
                dto.price,
                dto.description ?? (object)DBNull.Value,
                dto.stock,
                dto.manufacturer_id,
                dto.material ?? (object)DBNull.Value,
                dto.color ?? (object)DBNull.Value,
                dto.size ?? (object)DBNull.Value,
                dto.gender ?? (object)DBNull.Value,
                artistsJson,
                genresJson
            ).FirstOrDefaultAsync();
        }

        public async Task<bool> UpdateAsync(int id, ClothingCreateUpdateDto dto)
        {
            var artistsJson = JsonSerializer.Serialize(dto.artistIds ?? new List<int>());
            var genresJson = JsonSerializer.Serialize(dto.genreIds ?? new List<int>());
            var sql = "SELECT update_clothing({0}, {1}, {2}, {3}, {4}, {5}, {6}, {7}, {8}, {9}, {10}, {11})";
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
                dto.size ?? (object)DBNull.Value,
                dto.gender ?? (object)DBNull.Value,
                artistsJson,
                genresJson
            );
            return result > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var sql = "SELECT delete_clothing({0})";
            var result = await _context.Database.ExecuteSqlRawAsync(sql, id);
            return result > 0;
        }
    }
}