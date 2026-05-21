using Microsoft.EntityFrameworkCore;
using MusicMarketplace.Models;

namespace MusicMarketplace.Services
{
    public class MerchesService
    {
        private readonly MusicMarketplaceContext _context;
        public MerchesService(MusicMarketplaceContext context) => _context = context;

        public async Task<List<Merch>> GetAllAsync()
        {
            var sql = "SELECT * FROM get_all_merches()";
            return await _context.Set<Merch>().FromSqlRaw(sql).ToListAsync();
        }

        public async Task<Merch?> GetByIdAsync(int id)
        {
            var sql = "SELECT * FROM get_merch_by_id({0})";
            return await _context.Set<Merch>().FromSqlRaw(sql, id).FirstOrDefaultAsync();
        }

        public async Task<Merch> CreateAsync(Merch merch)
        {
            var sql = "SELECT * FROM create_merch({0}, {1}, {2})";
            var result = await _context.Set<Merch>().FromSqlRaw(
                sql,
                merch.product_id,
                merch.material ?? (object)DBNull.Value,
                merch.color ?? (object)DBNull.Value
            ).FirstOrDefaultAsync();
            return result;
        }

        public async Task<bool> UpdateAsync(int id, Merch merch)
        {
            var sql = "SELECT update_merch({0}, {1}, {2}, {3})";
            var result = await _context.Database.ExecuteSqlRawAsync(
                sql,
                id,
                merch.product_id,
                merch.material ?? (object)DBNull.Value,
                merch.color ?? (object)DBNull.Value
            );
            return result > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var sql = "SELECT delete_merch({0})";
            var result = await _context.Database.ExecuteSqlRawAsync(sql, id);
            return result > 0;
        }
    }
}