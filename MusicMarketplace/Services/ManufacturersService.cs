using Microsoft.EntityFrameworkCore;
using MusicMarketplace.Models;
using MusicMarketplace.DTOs;

namespace MusicMarketplace.Services
{
    public class ManufacturersService
    {
        private readonly MusicMarketplaceContext _context;
        public ManufacturersService(MusicMarketplaceContext context) => _context = context;
        public async Task<List<Manufacturer>> GetAllAsync()
        {
            return await _context.Manufacturers.ToListAsync();
        }

        public async Task<Manufacturer?> GetByIdAsync(int id)
        {
            return await _context.Manufacturers.FindAsync(id);
        }

        public async Task<Manufacturer> CreateAsync(ManufacturerDto dto)
        {
            if (await _context.Manufacturers.AnyAsync(m => m.name == dto.name))
                throw new InvalidOperationException("Производитель с таким названием уже существует");

            var manufacturer = new Manufacturer
            {
                name = dto.name,
                contact_info = dto.contact_info,
                country = dto.country
            };
            _context.Manufacturers.Add(manufacturer);
            await _context.SaveChangesAsync();
            return manufacturer;
        }

        public async Task UpdateAsync(int id, ManufacturerDto dto)
        {
            if (id != dto.manufacturer_id) throw new ArgumentException("ID mismatch");

            var manufacturer = await _context.Manufacturers.FindAsync(id);
            if (manufacturer == null) throw new KeyNotFoundException($"Manufacturer with id {id} not found");

            if (await _context.Manufacturers.AnyAsync(m => m.name == dto.name && m.manufacturer_id != id))
                throw new InvalidOperationException("Производитель с таким названием уже существует");

            manufacturer.name = dto.name;
            manufacturer.contact_info = dto.contact_info;
            manufacturer.country = dto.country;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var manufacturer = await _context.Manufacturers.FindAsync(id);
            if (manufacturer == null) throw new KeyNotFoundException($"Manufacturer with id {id} not found");
            _context.Manufacturers.Remove(manufacturer);
            await _context.SaveChangesAsync();
        }

        public async Task<List<Manufacturer>> GetFilteredAsync(string? searchName, string? searchCountry, string? sortBy)
        {
            var query = _context.Manufacturers.AsQueryable();

            if (!string.IsNullOrEmpty(searchName))
                query = query.Where(m => m.name.ToLower().Contains(searchName.ToLower()));

            if (!string.IsNullOrEmpty(searchCountry))
                query = query.Where(m => m.country != null && m.country.ToLower().Contains(searchCountry.ToLower()));

            query = sortBy switch
            {
                "name_asc" => query.OrderBy(m => m.name),
                "name_desc" => query.OrderByDescending(m => m.name),
                _ => query.OrderBy(m => m.manufacturer_id)
            };

            return await query.ToListAsync();
        }

        public async Task<List<string>> GetNamesAsync()
        {
            return await _context.Manufacturers.Select(m => m.name).ToListAsync();
        }

        public async Task<List<string>> GetCountriesAsync()
        {
            return await _context.Manufacturers
                .Where(m => m.country != null)
                .Select(m => m.country)
                .Distinct()
                .ToListAsync();
        }
    }
}