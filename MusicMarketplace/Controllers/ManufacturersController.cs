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
                contact_info = dto.contact_info
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
    }
}