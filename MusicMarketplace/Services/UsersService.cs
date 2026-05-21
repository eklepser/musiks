using Microsoft.EntityFrameworkCore;
using MusicMarketplace.DTOs;
using MusicMarketplace.Models;

namespace MusicMarketplace.Services
{
    public class UsersService
    {
        private readonly MusicMarketplaceContext _context;
        public UsersService(MusicMarketplaceContext context) => _context = context;

        public async Task<List<User>> GetAllAsync()
        {
            var sql = "SELECT * FROM get_all_users()";
            return await _context.Set<User>().FromSqlRaw(sql).ToListAsync();
        }

        public async Task<User?> GetByIdAsync(int id)
        {
            var sql = "SELECT * FROM get_user_by_id({0})";
            return await _context.Set<User>().FromSqlRaw(sql, id).FirstOrDefaultAsync();
        }

        public async Task<User> CreateAsync(UserDto dto)
        {
            var sql = "SELECT * FROM create_user({0}, {1}, {2}, {3})";
            return await _context.Set<User>().FromSqlRaw(sql, dto.login, dto.email, dto.full_name, dto.password).FirstOrDefaultAsync();
        }

        public async Task<bool> UpdateAsync(int id, UserDto dto)
        {
            var sql = "SELECT update_user({0}, {1}, {2}, {3}, {4})";
            var result = await _context.Database.ExecuteSqlRawAsync(sql, id, dto.login, dto.email, dto.full_name, dto.password ?? (object)DBNull.Value);
            return result > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var sql = "SELECT delete_user({0})";
            var result = await _context.Database.ExecuteSqlRawAsync(sql, id);
            return result > 0;
        }
    }
}