using Microsoft.AspNetCore.Mvc;
using MusicMarketplace.DTOs;
using MusicMarketplace.Services;
using Npgsql; // Добавлено для обработки ошибок Postgres

namespace MusicMarketplace.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly UsersService _usersService;

        public UsersController(UsersService usersService)
        {
            _usersService = usersService;
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _usersService.GetAllAsync();
            return Ok(users);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUser(int id)
        {
            var user = await _usersService.GetByIdAsync(id);
            if (user == null) return NotFound(new { message = "Пользователь не найден" });
            return Ok(user);
        }

        [HttpPost]
        public async Task<IActionResult> PostUser(UserDto dto)
        {
            try
            {
                var user = await _usersService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetUser), new { id = user.user_id }, user);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (PostgresException pgEx)
            {
                // Перехватываем ошибку, возникшую внутри хранимой процедуры (например, RAISE EXCEPTION)
                // pgEx.MessageText содержит текст ошибки: "Логин уже существует"
                return Conflict(new { message = pgEx.MessageText });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Произошла внутренняя ошибка сервера" });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutUser(int id, UserDto dto)
        {
            try
            {
                await _usersService.UpdateAsync(id, dto);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (PostgresException pgEx)
            {
                return Conflict(new { message = pgEx.MessageText });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Произошла внутренняя ошибка сервера" });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            try
            {
                await _usersService.DeleteAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Произошла ошибка при удалении" });
            }
        }

        [HttpGet("filter")]
        public async Task<IActionResult> GetUsersFiltered(
        [FromQuery] string? searchName = null,
        [FromQuery] string? sortBy = null)
        {
            var users = await _usersService.GetFilteredAsync(searchName, sortBy);
            return Ok(users);
        }
    }
}   