using Microsoft.AspNetCore.Mvc;
using MusicMarketplace.Models;
using MusicMarketplace.Services;

namespace MusicMarketplace.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MerchesController : ControllerBase
    {
        private readonly MerchesService _merchesService;
        public MerchesController(MerchesService merchesService)
        {
            _merchesService = merchesService;
        }

        [HttpGet]
        public async Task<IActionResult> GetMerches()
        {
            var items = await _merchesService.GetAllAsync();
            return Ok(items);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetMerch(int id)
        {
            var merch = await _merchesService.GetByIdAsync(id);
            if (merch == null) return NotFound();
            return Ok(merch);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutMerch(int id, Merch merch)
        {
            try
            {
                await _merchesService.UpdateAsync(id, merch);
                return NoContent();
            }
            catch (ArgumentException)
            {
                return BadRequest();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpPost]
        public async Task<IActionResult> PostMerch(Merch merch)
        {
            var result = await _merchesService.CreateAsync(merch);
            return CreatedAtAction(nameof(GetMerch), new { id = result.merch_id }, result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMerch(int id)
        {
            try
            {
                await _merchesService.DeleteAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }
    }
}