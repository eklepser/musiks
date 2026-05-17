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
    public class AccessoriesController : ControllerBase
    {
        private readonly MusicMarketplaceContext _context;

        public AccessoriesController(MusicMarketplaceContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Accessory>>> GetAccessories()
        {
            return await _context.Accessories.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Accessory>> GetAccessory(int id)
        {
            var accessory = await _context.Accessories.FindAsync(id);
            if (accessory == null) return NotFound();
            return accessory;
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutAccessory(int id, AccessoryUpdateDto dto)
        {
            if (id != dto.accessory_id) return BadRequest();

            var accessory = await _context.Accessories.FindAsync(id);
            if (accessory == null) return NotFound();

            accessory.merch_id = dto.merch_id;
            accessory.accessory_type = dto.accessory_type;
            accessory.weight = dto.weight;

            _context.Entry(accessory).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost]
        public async Task<ActionResult<Accessory>> PostAccessory(AccessoryCreateWithProductDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

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

            await transaction.CommitAsync();

            return CreatedAtAction(nameof(GetAccessory), new { id = accessory.accessory_id }, accessory);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAccessory(int id)
        {
            var accessory = await _context.Accessories.FindAsync(id);
            if (accessory == null) return NotFound();

            var merch = await _context.Merches.FindAsync(accessory.merch_id);
            Product product = null;
            if (merch != null) product = await _context.Products.FindAsync(merch.product_id);

            _context.Accessories.Remove(accessory);
            if (merch != null) _context.Merches.Remove(merch);
            if (product != null) _context.Products.Remove(product);

            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}