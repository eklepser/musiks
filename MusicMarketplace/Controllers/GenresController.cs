using Microsoft.AspNetCore.Mvc;
using MusicMarketplace.DTOs;
using MusicMarketplace.Services;

namespace MusicMarketplace.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GenresController : ControllerBase
    {
        private readonly GenresService _genresService;
        public GenresController(GenresService genresService) => _genresService = genresService;

        [HttpGet]
        public async Task<IActionResult> GetGenres()
        {
            var genres = await _genresService.GetAllAsync();
            return Ok(genres);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetGenre(int id)
        {
            var genre = await _genresService.GetByIdAsync(id);
            if (genre == null) return NotFound(new { message = $"Жанр с ID {id} не найден" });
            return Ok(genre);
        }

        [HttpPost]
        public async Task<IActionResult> PostGenre(GenreDto dto)
        {
            try
            {
                var genre = await _genresService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetGenre), new { id = genre.genre_id }, genre);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutGenre(int id, GenreDto dto)
        {
            try
            {
                await _genresService.UpdateAsync(id, dto);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGenre(int id)
        {
            try
            {
                await _genresService.DeleteAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        [HttpGet("filter")]
        public async Task<IActionResult> GetGenresFiltered(
            [FromQuery] string? searchName = null,
            [FromQuery] string? sortBy = null)
        {
            var genres = await _genresService.GetFilteredAsync(searchName, sortBy);
            return Ok(genres);
        }

        [HttpGet("filter/names")]
        public async Task<IActionResult> GetGenreNames()
        {
            var names = await _genresService.GetNamesAsync();
            return Ok(names);
        }
    }
}