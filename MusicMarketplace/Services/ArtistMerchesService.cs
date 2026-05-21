using Microsoft.EntityFrameworkCore;
using MusicMarketplace.DTOs;
using MusicMarketplace.Models;

namespace MusicMarketplace.Services
{
    public class ArtistMerchesService
    {
        private readonly MusicMarketplaceContext _context;
        public ArtistMerchesService(MusicMarketplaceContext context) => _context = context;

        public async Task<List<ArtistMerchDto>> GetAllAsync()
        {
            var data = await _context.ArtistMerches
                .Join(_context.Artists, am => am.artist_id, a => a.artist_id, (am, a) => new { am, artist_name = a.name })
                .Join(_context.Merches, x => x.am.merch_id, m => m.merch_id, (x, m) => new { x, merch = m })
                .Join(_context.Products, x => x.merch.product_id, p => p.product_id, (x, p) => new ArtistMerchDto
                {
                    artist_id = x.x.am.artist_id,
                    merch_id = x.x.am.merch_id,
                    artist_name = x.x.artist_name,
                    product_name = p.name
                })
                .ToListAsync();
            return data;
        }

        public async Task<List<ArtistMerchDto>> GetByMerchAsync(int merchId)
        {
            var data = await _context.ArtistMerches
                .Where(am => am.merch_id == merchId)
                .Join(_context.Artists, am => am.artist_id, a => a.artist_id, (am, a) => new ArtistMerchDto
                {
                    artist_id = am.artist_id,
                    merch_id = am.merch_id,
                    artist_name = a.name
                })
                .ToListAsync();
            return data;
        }

        public async Task<ArtistMerch> CreateAsync(ArtistMerch dto)
        {
            _context.ArtistMerches.Add(dto);
            await _context.SaveChangesAsync();
            return dto;
        }

        public async Task<bool> DeleteAsync(int artistId, int merchId)
        {
            var entity = await _context.ArtistMerches.FindAsync(artistId, merchId);
            if (entity == null) return false;
            _context.ArtistMerches.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}