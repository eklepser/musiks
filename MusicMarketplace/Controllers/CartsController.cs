using Microsoft.AspNetCore.Mvc;
using MusicMarketplace.Controllers;
using MusicMarketplace.DTOs;
using MusicMarketplace.Services;
using Npgsql;

namespace MusicMarketplace.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CartsController : ControllerBase
    {
        private readonly CartsService _cartsService;
        public CartsController(CartsService cartsService) => _cartsService = cartsService;
        [HttpGet("byUser/{userId}")]
        public async Task<IActionResult> GetByUser(int userId)
        {
            var items = await _cartsService.GetByUserAsync(userId);
            return Ok(items);
        }
        [HttpPost]
        public async Task<IActionResult> PostCart(CartCreateDto dto)
        {
            try
            {
                var newQuantity = await _cartsService.PostCartAsync(dto);
                return Ok(new { quantity = newQuantity });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }
        [HttpDelete("{userId}/{productId}")]
        public async Task<IActionResult> DeleteCartItem(int userId, int productId, [FromQuery] int quantity = 0)
        {
            try
            {
                await _cartsService.DeleteCartItemAsync(userId, productId, quantity);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
        [HttpPost("checkout/{userId}")]
        public async Task<IActionResult> Checkout(int userId)
        {
            try
            {
                var (orderId, totalAmount) = await _cartsService.CheckoutAsync(userId);
                return Ok(new { orderId, totalAmount });
            }
            catch (PostgresException pgEx) when (pgEx.SqlState == "P0001")
            {
                return BadRequest(new { message = pgEx.MessageText });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Ошибка оформления заказа: " + ex.Message });
            }
        }
        [HttpGet("byUser/{userId}/filter")]
        public async Task<IActionResult> GetCartFiltered(int userId,
        [FromQuery] string? searchName = null,
        [FromQuery] string? sortBy = null)
        {
            var items = await _cartsService.GetCartFilteredAsync(userId, searchName, sortBy);
            return Ok(items);
        }
    }
}