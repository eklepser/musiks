using Microsoft.EntityFrameworkCore;
using MusicMarketplace.Models;

namespace MusicMarketplace.Services
{
    public class UsersService
    {
        private readonly MusicMarketplaceContext _context;
        public UsersService(MusicMarketplaceContext context) => _context = context;

        public class UserDto
        {
            public int user_id { get; set; }
            public string login { get; set; }
            public string email { get; set; }
            public string full_name { get; set; }
            public string password { get; set; }
        }

        public async Task<List<User>> GetAllAsync()
        {
            return await _context.Users.ToListAsync();
        }

        public async Task<User?> GetByIdAsync(int id)
        {
            return await _context.Users.FindAsync(id);
        }

        public async Task<User> CreateAsync(UserDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.password))
                throw new ArgumentException("Пароль обязателен при создании");

            if (await _context.Users.AnyAsync(u => u.login == dto.login))
                throw new InvalidOperationException("Логин уже существует");

            if (await _context.Users.AnyAsync(u => u.email == dto.email))
                throw new InvalidOperationException("Email уже существует");

            var user = new User
            {
                login = dto.login,
                email = dto.email,
                full_name = dto.full_name,
                registration_date = DateTime.UtcNow,
                password_hash = dto.password
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task UpdateAsync(int id, UserDto dto)
        {
            if (id != dto.user_id) throw new ArgumentException("ID mismatch");

            var user = await _context.Users.FindAsync(id);
            if (user == null) throw new KeyNotFoundException($"User with id {id} not found");

            if (await _context.Users.AnyAsync(u => u.login == dto.login && u.user_id != id))
                throw new InvalidOperationException("Логин уже занят другим пользователем");

            if (await _context.Users.AnyAsync(u => u.email == dto.email && u.user_id != id))
                throw new InvalidOperationException("Email уже занят другим пользователем");

            user.login = dto.login;
            user.email = dto.email;
            user.full_name = dto.full_name;

            if (!string.IsNullOrWhiteSpace(dto.password))
                user.password_hash = dto.password;

            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) throw new KeyNotFoundException($"User with id {id} not found");
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
        }
    }
}