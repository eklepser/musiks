using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MusicMarketplace.Models;
using static MusicMarketplace.Controllers.AccessoriesController;

namespace MusicMarketplace.Services
{
    public class AccessoriesService
    {
        private readonly MusicMarketplaceContext _context;
        public AccessoriesService(MusicMarketplaceContext context) => _context = context;

        public async Task<List<AccessoryResponseDto>> GetAllAsync()
        {
            var items = await (from a in _context.Accessories
                               join m in _context.Merches on a.merch_id equals m.merch_id
                               join p in _context.Products on m.product_id equals p.product_id
                               select new AccessoryResponseDto
                               {
                                   accessory_id = a.accessory_id,
                                   product_id = p.product_id,
                                   name = p.name,
                                   price = p.price,
                                   description = p.description,
                                   stock = p.stock,
                                   manufacturer_id = p.manufacturer_id,
                                   material = m.material,
                                   color = m.color,
                                   accessory_type = a.accessory_type,
                                   weight = a.weight
                               }).ToListAsync();

            foreach (var item in items)
            {
                var artistNamesList = await _context.ArtistMerches
                    .Where(am => am.merch_id == item.accessory_id)
                    .Join(_context.Artists,
                          am => am.artist_id,
                          a => a.artist_id,
                          (am, a) => a.name)
                    .ToListAsync();
                item.artistIds = await _context.ArtistMerches
                    .Where(am => am.merch_id == item.accessory_id)
                    .Select(am => am.artist_id)
                    .ToListAsync();
                item.artistNames = string.Join(", ", artistNamesList);
            }
            return items;
        }

        public async Task<AccessoryResponseDto> GetByIdAsync(int id)
        {
            var item = await (from a in _context.Accessories
                              join m in _context.Merches on a.merch_id equals m.merch_id
                              join p in _context.Products on m.product_id equals p.product_id
                              where a.accessory_id == id
                              select new AccessoryResponseDto
                              {
                                  accessory_id = a.accessory_id,
                                  product_id = p.product_id,
                                  name = p.name,
                                  price = p.price,
                                  description = p.description,
                                  stock = p.stock,
                                  manufacturer_id = p.manufacturer_id,
                                  material = m.material,
                                  color = m.color,
                                  accessory_type = a.accessory_type,
                                  weight = a.weight
                              }).FirstOrDefaultAsync();

            if (item == null) return null;

            var artistNamesList = await _context.ArtistMerches
                .Where(am => am.merch_id == item.accessory_id)
                .Join(_context.Artists,
                      am => am.artist_id,
                      a => a.artist_id,
                      (am, a) => a.name)
                .ToListAsync();
            item.artistIds = await _context.ArtistMerches
                .Where(am => am.merch_id == item.accessory_id)
                .Select(am => am.artist_id)
                .ToListAsync();
            item.artistNames = string.Join(", ", artistNamesList);
            return item;
        }

        public async Task<AccessoryResponseDto> CreateAsync(AccessoryCreateUpdateDto dto)
        {
            using var tx = await _context.Database.BeginTransactionAsync();
            try
            {
                var product = new Product
                {
                    name = dto.name,
                    price = dto.price,
                    description = dto.description,
                    stock = dto.stock,
                    manufacturer_id = dto.manufacturer_id
                };
                _context.Products.Add(product);
                await _context.SaveChangesAsync();

                var merch = new Merch
                {
                    product_id = product.product_id,
                    material = dto.material,
                    color = dto.color
                };
                _context.Merches.Add(merch);
                await _context.SaveChangesAsync();

                var accessory = new Accessory
                {
                    merch_id = merch.merch_id,
                    accessory_type = dto.accessory_type,
                    weight = dto.weight
                };
                _context.Accessories.Add(accessory);
                await _context.SaveChangesAsync();

                if (dto.artistIds != null && dto.artistIds.Any())
                {
                    foreach (var artistId in dto.artistIds)
                    {
                        _context.ArtistMerches.Add(new ArtistMerch { artist_id = artistId, merch_id = merch.merch_id });
                    }
                    await _context.SaveChangesAsync();
                }

                await tx.CommitAsync();

                return new AccessoryResponseDto
                {
                    accessory_id = accessory.accessory_id,
                    product_id = product.product_id,
                    name = dto.name,
                    price = dto.price,
                    description = dto.description,
                    stock = dto.stock,
                    manufacturer_id = dto.manufacturer_id,
                    material = dto.material,
                    color = dto.color,
                    accessory_type = dto.accessory_type,
                    weight = dto.weight,
                    artistIds = dto.artistIds ?? new List<int>()
                };
            }
            catch
            {
                await tx.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> UpdateAsync(int id, AccessoryCreateUpdateDto dto)
        {
            if (id != dto.accessory_id) return false;

            using var tx = await _context.Database.BeginTransactionAsync();
            try
            {
                var accessory = await _context.Accessories.FindAsync(id);
                if (accessory == null) return false;

                var merch = await _context.Merches.FindAsync(accessory.merch_id);
                if (merch == null) return false;

                var product = await _context.Products.FindAsync(merch.product_id);
                if (product == null) return false;

                product.name = dto.name;
                product.price = dto.price;
                product.description = dto.description;
                product.stock = dto.stock;
                product.manufacturer_id = dto.manufacturer_id;

                merch.material = dto.material;
                merch.color = dto.color;

                accessory.accessory_type = dto.accessory_type;
                accessory.weight = dto.weight;

                var oldLinks = await _context.ArtistMerches.Where(am => am.merch_id == merch.merch_id).ToListAsync();
                _context.ArtistMerches.RemoveRange(oldLinks);

                if (dto.artistIds != null && dto.artistIds.Any())
                {
                    foreach (var artistId in dto.artistIds)
                    {
                        _context.ArtistMerches.Add(new ArtistMerch { artist_id = artistId, merch_id = merch.merch_id });
                    }
                }

                await _context.SaveChangesAsync();
                await tx.CommitAsync();
                return true;
            }
            catch
            {
                await tx.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var accessory = await _context.Accessories.FindAsync(id);
            if (accessory == null) return false;

            var merch = await _context.Merches.FindAsync(accessory.merch_id);
            var product = merch != null ? await _context.Products.FindAsync(merch.product_id) : null;

            _context.Accessories.Remove(accessory);
            if (merch != null) _context.Merches.Remove(merch);
            if (product != null) _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}