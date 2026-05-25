// TicketsController.cs
using Microsoft.AspNetCore.Mvc;
using MusicMarketplace.DTOs;
using MusicMarketplace.Services;

namespace MusicMarketplace.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TicketsController : ControllerBase
    {
        private readonly TicketsService _ticketsService;
        public TicketsController(TicketsService ticketsService)
        {
            _ticketsService = ticketsService;
        }

        [HttpGet]
        public async Task<IActionResult> GetTickets()
        {
            var tickets = await _ticketsService.GetAllAsync();
            return Ok(tickets);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetTicket(int id)
        {
            var ticket = await _ticketsService.GetByIdAsync(id);
            if (ticket == null) return NotFound();
            return Ok(ticket);
        }

        [HttpPost]
        public async Task<IActionResult> PostTicket(TicketDto dto)
        {
            try
            {
                var result = await _ticketsService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetTicket), new { id = result.ticket_id }, result);
            }
            catch
            {
                return StatusCode(500);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutTicket(int id, TicketDto dto)
        {
            try
            {
                await _ticketsService.UpdateAsync(id, dto);
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
        public async Task<IActionResult> DeleteTicket(int id)
        {
            try
            {
                await _ticketsService.DeleteAsync(id);
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