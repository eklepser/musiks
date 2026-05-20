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
    public class ManufacturersController : ControllerBase
    {
        private readonly MusicMarketplaceContext _context;

        public ManufacturersController(MusicMarketplaceContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Manufacturer>>> GetManufacturers()
        {
            return await _context.Manufacturers.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Manufacturer>> GetManufacturer(int id)
        {
            var manufacturer = await _context.Manufacturers.FindAsync(id);
            if (manufacturer == null) return NotFound();
            return manufacturer;
        }

        [HttpPost]
        public async Task<ActionResult<Manufacturer>> PostManufacturer(ManufacturerDto dto)
        {
            if (await _context.Manufacturers.AnyAsync(m => m.name == dto.name))
                return Conflict("Производитель с таким названием уже существует");

            var manufacturer = new Manufacturer
            {
                name = dto.name,
                contact_info = dto.contact_info,
                country = dto.country
            };
            _context.Manufacturers.Add(manufacturer);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetManufacturer), new { id = manufacturer.manufacturer_id }, manufacturer);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutManufacturer(int id, ManufacturerDto dto)
        {
            if (id != dto.manufacturer_id) return BadRequest();

            var manufacturer = await _context.Manufacturers.FindAsync(id);
            if (manufacturer == null) return NotFound();

            if (await _context.Manufacturers.AnyAsync(m => m.name == dto.name && m.manufacturer_id != id))
                return Conflict("Производитель с таким названием уже существует");

            manufacturer.name = dto.name;
            manufacturer.contact_info = dto.contact_info;
            manufacturer.country = dto.country;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteManufacturer(int id)
        {
            var manufacturer = await _context.Manufacturers.FindAsync(id);
            if (manufacturer == null) return NotFound();
            _context.Manufacturers.Remove(manufacturer);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpGet("filter")]
        public async Task<ActionResult<IEnumerable<Manufacturer>>> GetManufacturersFiltered(
            [FromQuery] string? searchName = null,
            [FromQuery] string? searchCountry = null,
            [FromQuery] string? sortBy = null)
        {
            var query = _context.Manufacturers.AsQueryable();

            if (!string.IsNullOrEmpty(searchName))
                query = query.Where(m => m.name.ToLower().Contains(searchName.ToLower()));

            if (!string.IsNullOrEmpty(searchCountry))
                query = query.Where(m => m.country != null && m.country.ToLower().Contains(searchCountry.ToLower()));

            query = sortBy switch
            {
                "name_asc" => query.OrderBy(m => m.name),
                "name_desc" => query.OrderByDescending(m => m.name),
                _ => query.OrderBy(m => m.manufacturer_id)
            };

            return Ok(await query.ToListAsync());
        }

        [HttpGet("filter/names")]
        public async Task<ActionResult<IEnumerable<string>>> GetManufacturerNames()
        {
            var names = await _context.Manufacturers.Select(m => m.name).ToListAsync();
            return Ok(names);
        }

        [HttpGet("filter/countries")]
        public async Task<ActionResult<IEnumerable<string>>> GetManufacturerCountries()
        {
            var countries = await _context.Manufacturers
                .Where(m => m.country != null)
                .Select(m => m.country)
                .Distinct()
                .ToListAsync();
            return Ok(countries);
        }
    }
}