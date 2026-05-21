using Microsoft.EntityFrameworkCore;
using MusicMarketplace.DTOs;
using MusicMarketplace.Models;

namespace MusicMarketplace.Services
{
    public class ManufacturersService
    {
        private readonly MusicMarketplaceContext _context;
        public ManufacturersService(MusicMarketplaceContext context) => _context = context;

        public async Task<List<Manufacturer>> GetAllAsync()
        {
            var sql = "SELECT * FROM get_all_manufacturers()";
            return await _context.Set<Manufacturer>().FromSqlRaw(sql).ToListAsync();
        }

        public async Task<Manufacturer?> GetByIdAsync(int id)
        {
            var sql = "SELECT * FROM get_manufacturer_by_id({0})";
            return await _context.Set<Manufacturer>().FromSqlRaw(sql, id).FirstOrDefaultAsync();
        }

        public async Task<Manufacturer> CreateAsync(ManufacturerDto dto)
        {
            var sql = "SELECT * FROM create_manufacturer({0}, {1}, {2})";
            var result = await _context.Set<Manufacturer>().FromSqlRaw(
                sql,
                dto.name,
                dto.contact_info ?? (object)DBNull.Value,
                dto.country ?? (object)DBNull.Value
            ).FirstOrDefaultAsync();
            return result;
        }

        public async Task<bool> UpdateAsync(int id, ManufacturerDto dto)
        {
            var sql = "SELECT update_manufacturer({0}, {1}, {2}, {3})";
            var result = await _context.Database.ExecuteSqlRawAsync(
                sql,
                id,
                dto.name,
                dto.contact_info ?? (object)DBNull.Value,
                dto.country ?? (object)DBNull.Value
            );
            return result > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var sql = "SELECT delete_manufacturer({0})";
            var result = await _context.Database.ExecuteSqlRawAsync(sql, id);
            return result > 0;
        }

        public async Task<List<Manufacturer>> GetFilteredAsync(string? searchName, string? searchCountry, string? sortBy)
        {
            var sql = "SELECT * FROM get_filtered_manufacturers({0}, {1}, {2})";
            return await _context.Set<Manufacturer>().FromSqlRaw(
                sql,
                searchName ?? (object)DBNull.Value,
                searchCountry ?? (object)DBNull.Value,
                sortBy ?? (object)DBNull.Value
            ).ToListAsync();
        }

        public async Task<List<string>> GetNamesAsync()
        {
            var sql = "SELECT * FROM get_manufacturer_names()";
            var result = await _context.Database.SqlQueryRaw<NameResult>(sql).ToListAsync();
            return result.Select(r => r.name).ToList();
        }

        public async Task<List<string>> GetCountriesAsync()
        {
            var sql = "SELECT * FROM get_manufacturer_countries()";
            var result = await _context.Database.SqlQueryRaw<CountryResult>(sql).ToListAsync();
            return result.Select(r => r.country).ToList();
        }

        private class NameResult { public string name { get; set; } }
        private class CountryResult { public string country { get; set; } }
    }
}