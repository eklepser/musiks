using Microsoft.AspNetCore.Mvc;
using MusicMarketplace.Models;
using MusicMarketplace.Services;
using System.Threading.Tasks;

namespace MusicMarketplace.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccessoriesController : ControllerBase
    {
        private readonly AccessoriesService _service;
        public AccessoriesController(AccessoriesService service) => _service = service;

        [HttpGet]
        public async Task<IActionResult> GetAccessories()
        {
            var items = await _service.GetAllAsync();
            return Ok(items);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetAccessory(int id)
        {
            var item = await _service.GetByIdAsync(id);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [HttpPost]
        public async Task<IActionResult> PostAccessory(AccessoryCreateUpdateDto dto)
        {
            var result = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetAccessory), new { id = result.accessory_id }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutAccessory(int id, AccessoryCreateUpdateDto dto)
        {
            var updated = await _service.UpdateAsync(id, dto);
            if (!updated) return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAccessory(int id)
        {
            var deleted = await _service.DeleteAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}