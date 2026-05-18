using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MusicMarketplace.Models;

namespace MusicMarketplace.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly MusicMarketplaceContext _context;

        public UsersController(MusicMarketplaceContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            return await _context.Users.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();
            return user;
        }

        [HttpPost]
        public async Task<ActionResult<User>> PostUser(UserDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.password))
                return BadRequest("Пароль обязателен при создании");

            if (await _context.Users.AnyAsync(u => u.login == dto.login))
                return Conflict("Логин уже существует");

            if (await _context.Users.AnyAsync(u => u.email == dto.email))
                return Conflict("Email уже существует");

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
            return CreatedAtAction(nameof(GetUser), new { id = user.user_id }, user);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutUser(int id, UserDto dto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            if (await _context.Users.AnyAsync(u => u.login == dto.login && u.user_id != id))
                return Conflict("Логин уже занят другим пользователем");

            if (await _context.Users.AnyAsync(u => u.email == dto.email && u.user_id != id))
                return Conflict("Email уже занят другим пользователем");

            user.login = dto.login;
            user.email = dto.email;
            user.full_name = dto.full_name;

            if (!string.IsNullOrWhiteSpace(dto.password))
            {
                if (dto.password.Length < 4)
                    return BadRequest("Пароль должен быть не менее 4 символов");
                user.password_hash = dto.password;
            }

            _context.Entry(user).Property(u => u.registration_date).IsModified = false;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}