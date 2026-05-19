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
            public string name { get; set; }
            public decimal price { get; set; }
            public string description { get; set; }
            public int stock { get; set; }
            public int manufacturer_id { get; set; }
            public string material { get; set; }
            public string color { get; set; }
            public string accessory_type { get; set; }
            public decimal? weight { get; set; }
        }

        public class AccessoryCreateDto
        {
            public string name { get; set; }
            public decimal price { get; set; }
            public string description { get; set; }
            public int stock { get; set; }
            public int manufacturer_id { get; set; }
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
        public async Task<IActionResult> PostAccessory(AccessoryCreateDto dto)
        {
            using var tx = await _context.Database.BeginTransactionAsync();

            var product = new Product
            {
                name = dto.name,
                price = dto.price,
                description = dto.description,
                stock = dto.stock,
                manufacturer_id = dto.manufacturer_id
            };
            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            var merch = new Merch
            {
                product_id = product.product_id,
                material = dto.material,
                color = dto.color
            };
            _context.Merches.Add(merch);
            await _context.SaveChangesAsync();

            var accessory = new Accessory
            {
                merch_id = merch.merch_id,
                accessory_type = dto.accessory_type,
                weight = dto.weight
            };
            _context.Accessories.Add(accessory);
            await _context.SaveChangesAsync();

            await tx.CommitAsync();
            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutAccessory(int id, AccessoryDto dto)
        {
            if (id != dto.accessory_id) return BadRequest();

            using var tx = await _context.Database.BeginTransactionAsync();

            var accessory = await _context.Accessories.FindAsync(id);
            if (accessory == null) return NotFound();

            var merch = await _context.Merches.FindAsync(accessory.merch_id);
            if (merch == null) return NotFound();

            var product = await _context.Products.FindAsync(merch.product_id);
            if (product == null) return NotFound();

            product.name = dto.name;
            product.price = dto.price;
            product.description = dto.description;
            product.stock = dto.stock;
            product.manufacturer_id = dto.manufacturer_id;

            merch.material = dto.material;
            merch.color = dto.color;

            accessory.accessory_type = dto.accessory_type;
            accessory.weight = dto.weight;

            await _context.SaveChangesAsync();
            await tx.CommitAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAccessory(int id)
        {
            var accessory = await _context.Accessories.FindAsync(id);
            if (accessory == null) return NotFound();

            var merch = await _context.Merches.FindAsync(accessory.merch_id);
            var product = merch != null ? await _context.Products.FindAsync(merch.product_id) : null;

            _context.Accessories.Remove(accessory);
            if (merch != null) _context.Merches.Remove(merch);
            if (product != null) _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}