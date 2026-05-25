// ClothingsController.cs
using Microsoft.AspNetCore.Mvc;
using MusicMarketplace.DTOs;
using MusicMarketplace.Services;

namespace MusicMarketplace.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClothingsController : ControllerBase
    {
        private readonly ClothingsService _clothingsService;
        public ClothingsController(ClothingsService clothingsService)
        {
            _clothingsService = clothingsService;
        }

        [HttpGet]
        public async Task<IActionResult> GetClothings()
        {
            var items = await _clothingsService.GetAllAsync();
            return Ok(items);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetClothing(int id)
        {
            var item = await _clothingsService.GetByIdAsync(id);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [HttpPost]
        public async Task<IActionResult> PostClothing(ClothingCreateUpdateDto dto)
        {
            var result = await _clothingsService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetClothing), new { id = result.clothing_id }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutClothing(int id, ClothingCreateUpdateDto dto)
        {
            try
            {
                await _clothingsService.UpdateAsync(id, dto);
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

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteClothing(int id)
        {
            try
            {
                await _clothingsService.DeleteAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
        }
    }
}