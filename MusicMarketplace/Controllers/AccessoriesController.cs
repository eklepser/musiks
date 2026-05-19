using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MusicMarketplace.Models;

namespace MusicMarketplace.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccessoriesController : ControllerBase
    {
        private readonly MusicMarketplaceContext _context;
        public AccessoriesController(MusicMarketplaceContext context) => _context = context;

        public class AccessoryDto
        {
            public int accessory_id { get; set; }
            public int product_id { get; set; }
            public string name { get; set; }
            public decimal price { get; set; }
            public string description { get; set; }
            public int stock { get; set; }
            public int? manufacturer_id { get; set; }
            public string material { get; set; }
            public string color { get; set; }
            public string accessory_type { get; set; }
            public decimal? weight { get; set; }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AccessoryDto>>> GetAccessories()
        {
            var items = await (from a in _context.Accessories
                               join m in _context.Merches on a.merch_id equals m.merch_id
                               join p in _context.Products on m.product_id equals p.product_id
                               select new AccessoryDto
                               {
                                   accessory_id = a.accessory_id,
                                   product_id = p.product_id,
                                   name = p.name,
                                   price = p.price,
                                   description = p.description,
                                   stock = p.stock,
                                   manufacturer_id = p.manufacturer_id,
                                   material = m.material,
                                   color = m.color,
                                   accessory_type = a.accessory_type,
                                   weight = a.weight
                               }).ToListAsync();
            return Ok(items);
        }

        [HttpPost]
        public async Task<ActionResult<Accessory>> PostAccessory(Accessory accessory)
        {
            _context.Accessories.Add(accessory);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetAccessories), new { id = accessory.accessory_id }, accessory);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutAccessory(int id, Accessory accessory)
        {
            if (id != accessory.accessory_id) return BadRequest();
            _context.Entry(accessory).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAccessory(int id)
        {
            var accessory = await _context.Accessories.FindAsync(id);
            if (accessory == null) return NotFound();
            _context.Accessories.Remove(accessory);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}