using Microsoft.EntityFrameworkCore;
using MusicMarketplace.Models;
using MusicMarketplace.DTOs;

namespace MusicMarketplace.Services
{
    public class MerchesService
    {
        private readonly MusicMarketplaceContext _context;
        public MerchesService(MusicMarketplaceContext context) => _context = context;

        public async Task<List<Merch>> GetAllAsync()
        {
            return await _context.Merches.ToListAsync();
        }

        public async Task<Merch?> GetByIdAsync(int id)
        {
            return await _context.Merches.FindAsync(id);
        }

        public async Task<Merch> CreateAsync(Merch merch)
        {
            _context.Merches.Add(merch);
            await _context.SaveChangesAsync();
            return merch;
        }

        public async Task UpdateAsync(int id, Merch merch)
        {
            if (id != merch.merch_id) throw new ArgumentException("ID mismatch");
            _context.Entry(merch).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _context.Merches.AnyAsync(m => m.merch_id == id))
                    throw new KeyNotFoundException($"Merch with id {id} not found");
                throw;
            }
        }

        public async Task DeleteAsync(int id)
        {
            var merch = await _context.Merches.FindAsync(id);
            if (merch == null) throw new KeyNotFoundException($"Merch with id {id} not found");
            _context.Merches.Remove(merch);
            await _context.SaveChangesAsync();
        }
    }
}