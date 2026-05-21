using Microsoft.EntityFrameworkCore;
using MusicMarketplace.DTOs;
using MusicMarketplace.Models;

namespace MusicMarketplace.Services
{
    public class ArtistsService
    {
        private readonly MusicMarketplaceContext _context;
        public ArtistsService(MusicMarketplaceContext context) => _context = context;

        public async Task<List<ArtistDto>> GetAllAsync()
        {
            return await _context.Artists
                .Select(a => new ArtistDto
                {
                    artist_id = a.artist_id,
                    name = a.name,
                    country = a.country,
                    debut_year = a.debut_year,
                    language = a.language
                })
                .ToListAsync();
        }

        public async Task<ArtistDto?> GetByIdAsync(int id)
        {
            var artist = await _context.Artists.FindAsync(id);
            if (artist == null) return null;
            return new ArtistDto
            {
                artist_id = artist.artist_id,
                name = artist.name,
                country = artist.country,
                debut_year = artist.debut_year,
                language = artist.language
            };
        }

        public async Task<Artist> CreateAsync(ArtistDto dto)
        {
            if (await _context.Artists.AnyAsync(a => a.name == dto.name))
                throw new InvalidOperationException("Исполнитель с таким именем уже существует");

            var artist = new Artist
            {
                name = dto.name,
                country = dto.country,
                debut_year = dto.debut_year,
                language = dto.language
            };
            _context.Artists.Add(artist);
            await _context.SaveChangesAsync();
            return artist;
        }

        public async Task UpdateAsync(int id, ArtistDto dto)
        {
            if (id != dto.artist_id) throw new ArgumentException("ID mismatch");

            var artist = await _context.Artists.FindAsync(id);
            if (artist == null) throw new KeyNotFoundException($"Artist with id {id} not found");

            if (await _context.Artists.AnyAsync(a => a.name == dto.name && a.artist_id != id))
                throw new InvalidOperationException("Исполнитель с таким именем уже существует");

            artist.name = dto.name;
            artist.country = dto.country;
            artist.debut_year = dto.debut_year;
            artist.language = dto.language;

            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var artist = await _context.Artists.FindAsync(id);
            if (artist == null) throw new KeyNotFoundException($"Artist with id {id} not found");
            _context.Artists.Remove(artist);
            await _context.SaveChangesAsync();
        }

        public async Task<List<ArtistDto>> GetFilteredAsync(string? searchName, string? searchCountry, string? searchLanguage, string? sortBy)
        {
            var query = _context.Artists.AsQueryable();

            if (!string.IsNullOrEmpty(searchName))
                query = query.Where(a => a.name.ToLower().Contains(searchName.ToLower()));

            if (!string.IsNullOrEmpty(searchCountry))
                query = query.Where(a => a.country != null && a.country.ToLower().Contains(searchCountry.ToLower()));

            if (searchLanguage == "Instrumental")
                query = query.Where(a => a.language == null);
            else if (!string.IsNullOrEmpty(searchLanguage))
                query = query.Where(a => a.language != null && a.language.ToLower().Contains(searchLanguage.ToLower()));

            query = sortBy switch
            {
                "name_asc" => query.OrderBy(a => a.name),
                "name_desc" => query.OrderByDescending(a => a.name),
                _ => query.OrderBy(a => a.name)
            };

            return await query.Select(a => new ArtistDto
            {
                artist_id = a.artist_id,
                name = a.name,
                country = a.country,
                debut_year = a.debut_year,
                language = a.language
            }).ToListAsync();
        }
    }
}