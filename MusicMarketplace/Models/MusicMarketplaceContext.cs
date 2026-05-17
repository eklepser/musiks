using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace MusicMarketplace.Models;

public partial class MusicMarketplaceContext : DbContext
{
    public MusicMarketplaceContext()
    {
    }

    public MusicMarketplaceContext(DbContextOptions<MusicMarketplaceContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Accessory> Accessories { get; set; }

    public virtual DbSet<Artist> Artists { get; set; }

    public virtual DbSet<Cart> Carts { get; set; }

    public virtual DbSet<Clothing> Clothings { get; set; }

    public virtual DbSet<Concert> Concerts { get; set; }

    public virtual DbSet<Genre> Genres { get; set; }

    public virtual DbSet<Manufacturer> Manufacturers { get; set; }

    public virtual DbSet<Merch> Merches { get; set; }

    public virtual DbSet<Order> Orders { get; set; }

    public virtual DbSet<OrderItem> OrderItems { get; set; }

    public virtual DbSet<Product> Products { get; set; }

    public virtual DbSet<Review> Reviews { get; set; }

    public virtual DbSet<Ticket> Tickets { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<Wishlist> Wishlists { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseNpgsql("Host=localhost;Port=5432;Database=musify;Username=postgres;Password=psql");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Accessory>(entity =>
        {
            entity.HasKey(e => e.accessory_id).HasName("Accessory_pkey");

            entity.ToTable("Accessory");

            entity.HasIndex(e => e.merch_id, "Accessory_merch_id_key").IsUnique();

            entity.Property(e => e.accessory_type).HasMaxLength(50);
            entity.Property(e => e.weight).HasPrecision(6, 2);

            entity.HasOne(d => d.merch).WithOne(p => p.Accessory)
                .HasForeignKey<Accessory>(d => d.merch_id)
                .HasConstraintName("Accessory_merch_id_fkey");
        });

        modelBuilder.Entity<Artist>(entity =>
        {
            entity.HasKey(e => e.artist_id).HasName("Artist_pkey");

            entity.ToTable("Artist");

            entity.Property(e => e.country).HasMaxLength(50);
            entity.Property(e => e.language).HasMaxLength(50);
            entity.Property(e => e.name).HasMaxLength(100);

            entity.HasMany(d => d.concerts).WithMany(p => p.artists)
                .UsingEntity<Dictionary<string, object>>(
                    "ArtistConcert",
                    r => r.HasOne<Concert>().WithMany()
                        .HasForeignKey("concert_id")
                        .HasConstraintName("ArtistConcert_concert_id_fkey"),
                    l => l.HasOne<Artist>().WithMany()
                        .HasForeignKey("artist_id")
                        .HasConstraintName("ArtistConcert_artist_id_fkey"),
                    j =>
                    {
                        j.HasKey("artist_id", "concert_id").HasName("ArtistConcert_pkey");
                        j.ToTable("ArtistConcert");
                    });

            entity.HasMany(d => d.merches).WithMany(p => p.artists)
                .UsingEntity<Dictionary<string, object>>(
                    "ArtistMerch",
                    r => r.HasOne<Merch>().WithMany()
                        .HasForeignKey("merch_id")
                        .HasConstraintName("ArtistMerch_merch_id_fkey"),
                    l => l.HasOne<Artist>().WithMany()
                        .HasForeignKey("artist_id")
                        .HasConstraintName("ArtistMerch_artist_id_fkey"),
                    j =>
                    {
                        j.HasKey("artist_id", "merch_id").HasName("ArtistMerch_pkey");
                        j.ToTable("ArtistMerch");
                    });
        });

        modelBuilder.Entity<Cart>(entity =>
        {
            entity.HasKey(e => new { e.user_id, e.product_id }).HasName("Cart_pkey");

            entity.ToTable("Cart");

            entity.Property(e => e.added_date)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp without time zone");

            entity.HasOne(d => d.product).WithMany(p => p.Carts)
                .HasForeignKey(d => d.product_id)
                .HasConstraintName("Cart_product_id_fkey");

            entity.HasOne(d => d.user).WithMany(p => p.Carts)
                .HasForeignKey(d => d.user_id)
                .HasConstraintName("Cart_user_id_fkey");
        });

        modelBuilder.Entity<Clothing>(entity =>
        {
            entity.HasKey(e => e.clothing_id).HasName("Clothing_pkey");

            entity.ToTable("Clothing");

            entity.HasIndex(e => e.merch_id, "Clothing_merch_id_key").IsUnique();

            entity.Property(e => e.gender).HasMaxLength(10);
            entity.Property(e => e.size).HasMaxLength(10);

            entity.HasOne(d => d.merch).WithOne(p => p.Clothing)
                .HasForeignKey<Clothing>(d => d.merch_id)
                .HasConstraintName("Clothing_merch_id_fkey");
        });

        modelBuilder.Entity<Concert>(entity =>
        {
            entity.HasKey(e => e.concert_id).HasName("Concert_pkey");

            entity.ToTable("Concert");

            entity.Property(e => e.datetime).HasColumnType("timestamp without time zone");
            entity.Property(e => e.title).HasMaxLength(150);
            entity.Property(e => e.venue).HasMaxLength(100);
        });

        modelBuilder.Entity<Genre>(entity =>
        {
            entity.HasKey(e => e.genre_id).HasName("Genre_pkey");

            entity.ToTable("Genre");

            entity.HasIndex(e => e.name, "Genre_name_key").IsUnique();

            entity.Property(e => e.name).HasMaxLength(50);
        });

        modelBuilder.Entity<Manufacturer>(entity =>
        {
            entity.HasKey(e => e.manufacturer_id).HasName("Manufacturer_pkey");

            entity.ToTable("Manufacturer");

            entity.Property(e => e.contact_info).HasMaxLength(200);
            entity.Property(e => e.name).HasMaxLength(100);
        });

        modelBuilder.Entity<Merch>(entity =>
        {
            entity.HasKey(e => e.merch_id).HasName("Merch_pkey");

            entity.ToTable("Merch");

            entity.HasIndex(e => e.product_id, "Merch_product_id_key").IsUnique();

            entity.Property(e => e.color).HasMaxLength(30);
            entity.Property(e => e.material).HasMaxLength(50);

            entity.HasOne(d => d.product).WithOne(p => p.Merch)
                .HasForeignKey<Merch>(d => d.product_id)
                .HasConstraintName("Merch_product_id_fkey");
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.order_id).HasName("Order_pkey");

            entity.ToTable("Order");

            entity.Property(e => e.order_date)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp without time zone");
            entity.Property(e => e.status)
                .HasMaxLength(20)
                .HasDefaultValueSql("'pending'::character varying");
            entity.Property(e => e.total_amount).HasPrecision(10, 2);

            entity.HasOne(d => d.user).WithMany(p => p.Orders)
                .HasForeignKey(d => d.user_id)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("Order_user_id_fkey");
        });

        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.HasKey(e => new { e.order_id, e.product_id }).HasName("OrderItem_pkey");

            entity.ToTable("OrderItem");

            entity.Property(e => e.unit_price).HasPrecision(10, 2);

            entity.HasOne(d => d.order).WithMany(p => p.OrderItems)
                .HasForeignKey(d => d.order_id)
                .HasConstraintName("OrderItem_order_id_fkey");

            entity.HasOne(d => d.product).WithMany(p => p.OrderItems)
                .HasForeignKey(d => d.product_id)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("OrderItem_product_id_fkey");
        });

        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.product_id).HasName("Product_pkey");

            entity.ToTable("Product");

            entity.Property(e => e.name).HasMaxLength(200);
            entity.Property(e => e.price).HasPrecision(10, 2);
            entity.Property(e => e.stock).HasDefaultValue(0);

            entity.HasOne(d => d.manufacturer).WithMany(p => p.Products)
                .HasForeignKey(d => d.manufacturer_id)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("Product_manufacturer_id_fkey");

            entity.HasMany(d => d.genres).WithMany(p => p.products)
                .UsingEntity<Dictionary<string, object>>(
                    "ProductGenre",
                    r => r.HasOne<Genre>().WithMany()
                        .HasForeignKey("genre_id")
                        .HasConstraintName("ProductGenre_genre_id_fkey"),
                    l => l.HasOne<Product>().WithMany()
                        .HasForeignKey("product_id")
                        .HasConstraintName("ProductGenre_product_id_fkey"),
                    j =>
                    {
                        j.HasKey("product_id", "genre_id").HasName("ProductGenre_pkey");
                        j.ToTable("ProductGenre");
                    });
        });

        modelBuilder.Entity<Review>(entity =>
        {
            entity.HasKey(e => new { e.user_id, e.product_id }).HasName("Review_pkey");

            entity.ToTable("Review");

            entity.Property(e => e.review_date)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp without time zone");

            entity.HasOne(d => d.product).WithMany(p => p.Reviews)
                .HasForeignKey(d => d.product_id)
                .HasConstraintName("Review_product_id_fkey");

            entity.HasOne(d => d.user).WithMany(p => p.Reviews)
                .HasForeignKey(d => d.user_id)
                .HasConstraintName("Review_user_id_fkey");
        });

        modelBuilder.Entity<Ticket>(entity =>
        {
            entity.HasKey(e => e.ticket_id).HasName("Ticket_pkey");

            entity.ToTable("Ticket");

            entity.HasIndex(e => e.product_id, "Ticket_product_id_key").IsUnique();

            entity.Property(e => e.price_category).HasMaxLength(20);
            entity.Property(e => e.seat_number).HasMaxLength(10);
            entity.Property(e => e.seat_row).HasMaxLength(10);

            entity.HasOne(d => d.concert).WithMany(p => p.Tickets)
                .HasForeignKey(d => d.concert_id)
                .HasConstraintName("Ticket_concert_id_fkey");

            entity.HasOne(d => d.product).WithOne(p => p.Ticket)
                .HasForeignKey<Ticket>(d => d.product_id)
                .HasConstraintName("Ticket_product_id_fkey");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.user_id).HasName("User_pkey");

            entity.ToTable("User");

            entity.HasIndex(e => e.email, "User_email_key").IsUnique();

            entity.HasIndex(e => e.login, "User_login_key").IsUnique();

            entity.Property(e => e.email).HasMaxLength(100);
            entity.Property(e => e.full_name).HasMaxLength(100);
            entity.Property(e => e.login).HasMaxLength(50);
            entity.Property(e => e.password_hash)
                .HasMaxLength(255)
                .HasDefaultValueSql("''::character varying");
            entity.Property(e => e.registration_date).HasDefaultValueSql("CURRENT_DATE");
        });

        modelBuilder.Entity<Wishlist>(entity =>
        {
            entity.HasKey(e => new { e.user_id, e.product_id }).HasName("Wishlist_pkey");

            entity.ToTable("Wishlist");

            entity.Property(e => e.added_date)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp without time zone");

            entity.HasOne(d => d.product).WithMany(p => p.Wishlists)
                .HasForeignKey(d => d.product_id)
                .HasConstraintName("Wishlist_product_id_fkey");

            entity.HasOne(d => d.user).WithMany(p => p.Wishlists)
                .HasForeignKey(d => d.user_id)
                .HasConstraintName("Wishlist_user_id_fkey");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
