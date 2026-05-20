using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MusicMarketplace.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MusicMarketplace.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GenresController : ControllerBase
    {
        private readonly MusicMarketplaceContext _context;

        public GenresController(MusicMarketplaceContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Genre>>> GetGenres()
        {
            return await _context.Genres.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Genre>> GetGenre(int id)
        {
            var genre = await _context.Genres.FindAsync(id);
            if (genre == null) return NotFound();
            return genre;
        }

        [HttpPost]
        public async Task<ActionResult<Genre>> PostGenre(GenreDto dto)
        {
            if (await _context.Genres.AnyAsync(g => g.name == dto.name))
                return Conflict("Жанр с таким названием уже существует");

            var genre = new Genre
            {
                name = dto.name,
                description = dto.description
            };
            _context.Genres.Add(genre);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetGenre), new { id = genre.genre_id }, genre);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutGenre(int id, GenreDto dto)
        {
            if (id != dto.genre_id) return BadRequest();

            var genre = await _context.Genres.FindAsync(id);
            if (genre == null) return NotFound();

            if (await _context.Genres.AnyAsync(g => g.name == dto.name && g.genre_id != id))
                return Conflict("Жанр с таким названием уже существует");

            genre.name = dto.name;
            genre.description = dto.description;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGenre(int id)
        {
            var genre = await _context.Genres.FindAsync(id);
            if (genre == null) return NotFound();
            _context.Genres.Remove(genre);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpGet("filter")]
        public async Task<ActionResult<IEnumerable<Genre>>> GetGenresFiltered(
            [FromQuery] string? searchName = null,
            [FromQuery] string? sortBy = null)
        {
            var query = _context.Genres.AsQueryable();

            if (!string.IsNullOrEmpty(searchName))
                query = query.Where(g => g.name.ToLower().Contains(searchName.ToLower()));

            query = sortBy switch
            {
                "name_asc" => query.OrderBy(g => g.name),
                "name_desc" => query.OrderByDescending(g => g.name),
                _ => query.OrderBy(g => g.genre_id)
            };

            return Ok(await query.ToListAsync());
        }

        [HttpGet("filter/names")]
        public async Task<ActionResult<IEnumerable<string>>> GetGenreNames()
        {
            var names = await _context.Genres.Select(g => g.name).ToListAsync();
            return Ok(names);
        }
    }
}