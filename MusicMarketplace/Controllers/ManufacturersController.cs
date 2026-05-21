using Microsoft.AspNetCore.Mvc;
using MusicMarketplace.DTOs;
using MusicMarketplace.Services;

namespace MusicMarketplace.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ManufacturersController : ControllerBase
    {
        private readonly ManufacturersService _manufacturersService;
        public ManufacturersController(ManufacturersService manufacturersService)
        {
            _manufacturersService = manufacturersService;
        }

        [HttpGet]
        public async Task<IActionResult> GetManufacturers()
        {
            var manufacturers = await _manufacturersService.GetAllAsync();
            return Ok(manufacturers);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetManufacturer(int id)
        {
            var manufacturer = await _manufacturersService.GetByIdAsync(id);
            if (manufacturer == null) return NotFound();
            return Ok(manufacturer);
        }

        [HttpPost]
        public async Task<IActionResult> PostManufacturer(ManufacturerDto dto)
        {
            try
            {
                var manufacturer = await _manufacturersService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetManufacturer), new { id = manufacturer.manufacturer_id }, manufacturer);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutManufacturer(int id, ManufacturerDto dto)
        {
            try
            {
                await _manufacturersService.UpdateAsync(id, dto);
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
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteManufacturer(int id)
        {
            try
            {
                await _manufacturersService.DeleteAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpGet("filter")]
        public async Task<IActionResult> GetManufacturersFiltered(
            [FromQuery] string? searchName = null,
            [FromQuery] string? searchCountry = null,
            [FromQuery] string? sortBy = null)
        {
            var manufacturers = await _manufacturersService.GetFilteredAsync(searchName, searchCountry, sortBy);
            return Ok(manufacturers);
        }

        [HttpGet("filter/names")]
        public async Task<IActionResult> GetManufacturerNames()
        {
            var names = await _manufacturersService.GetNamesAsync();
            return Ok(names);
        }

        [HttpGet("filter/countries")]
        public async Task<IActionResult> GetManufacturerCountries()
        {
            var countries = await _manufacturersService.GetCountriesAsync();
            return Ok(countries);
        }
    }
}