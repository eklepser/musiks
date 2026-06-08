using Microsoft.EntityFrameworkCore;

namespace MusicMarketplace.Models;

public partial class MusicMarketplaceContext : DbContext
{
    public MusicMarketplaceContext() { }

    public MusicMarketplaceContext(DbContextOptions<MusicMarketplaceContext> options) : base(options) { }

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

    public virtual DbSet<ArtistConcert> ArtistConcerts { get; set; }
    public virtual DbSet<ArtistMerch> ArtistMerches { get; set; }
    public virtual DbSet<ProductGenre> ProductGenres { get; set; }
    public virtual DbSet<ChangeLog> ChangeLogs { get; set; }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Clothing>(entity =>
        {
            entity.ToTable("Clothing");
            entity.HasKey(e => e.clothing_id);
            entity.HasOne(e => e.Merch)
                  .WithMany(e => e.Clothings)
                  .HasForeignKey(e => e.merch_id);
        });

        modelBuilder.Entity<Accessory>(entity =>
        {
            entity.ToTable("Accessory");
            entity.HasKey(e => e.accessory_id);
            entity.HasOne(e => e.Merch)
                  .WithMany(e => e.Accessories)
                  .HasForeignKey(e => e.merch_id);
        });

        modelBuilder.Entity<Merch>(entity =>
        {
            entity.ToTable("Merch");
            entity.HasKey(e => e.merch_id);
            entity.HasOne(e => e.Product)
                  .WithMany(e => e.Merches)
                  .HasForeignKey(e => e.product_id);
        });

        modelBuilder.Entity<Artist>(entity =>
        {
            entity.HasKey(e => e.artist_id).HasName("Artist_pkey");
            entity.ToTable("Artist");
            entity.Property(e => e.country).HasMaxLength(50);
            entity.Property(e => e.language).HasMaxLength(50);
            entity.Property(e => e.name).HasMaxLength(100);
        });

        modelBuilder.Entity<Cart>(entity =>
        {
            entity.HasKey(e => new { e.user_id, e.product_id }).HasName("Cart_pkey");
            entity.ToTable("Cart");
            entity.Property(e => e.added_date).HasDefaultValueSql("CURRENT_TIMESTAMP").HasColumnType("timestamp without time zone");
            entity.HasOne(d => d.product).WithMany(p => p.Carts).HasForeignKey(d => d.product_id).HasConstraintName("Cart_product_id_fkey");
            entity.HasOne(d => d.user).WithMany(p => p.Carts).HasForeignKey(d => d.user_id).HasConstraintName("Cart_user_id_fkey");
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

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.order_id).HasName("Order_pkey");
            entity.ToTable("Order");
            entity.Property(e => e.order_date).HasDefaultValueSql("CURRENT_TIMESTAMP").HasColumnType("timestamp without time zone");
            entity.Property(e => e.status).HasMaxLength(20).HasDefaultValueSql("'pending'::character varying");
            entity.Property(e => e.total_amount).HasPrecision(10, 2);
            entity.HasOne(d => d.user).WithMany(p => p.Orders).HasForeignKey(d => d.user_id).OnDelete(DeleteBehavior.Restrict).HasConstraintName("Order_user_id_fkey");
        });

        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.HasKey(e => new { e.order_id, e.product_id }).HasName("OrderItem_pkey");
            entity.ToTable("OrderItem");
            entity.Property(e => e.unit_price).HasPrecision(10, 2);
            entity.HasOne(d => d.order).WithMany(p => p.OrderItems).HasForeignKey(d => d.order_id).HasConstraintName("OrderItem_order_id_fkey");
            entity.HasOne(d => d.product).WithMany(p => p.OrderItems).HasForeignKey(d => d.product_id).OnDelete(DeleteBehavior.Restrict).HasConstraintName("OrderItem_product_id_fkey");
        });

        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.product_id).HasName("Product_pkey");
            entity.ToTable("Product");
            entity.Property(e => e.name).HasMaxLength(200);
            entity.Property(e => e.price).HasPrecision(10, 2);
            entity.Property(e => e.stock).HasDefaultValue(0);
            entity.HasOne(d => d.manufacturer).WithMany(p => p.Products).HasForeignKey(d => d.manufacturer_id).OnDelete(DeleteBehavior.SetNull).HasConstraintName("Product_manufacturer_id_fkey");
        });

        modelBuilder.Entity<Review>(entity =>
        {
            entity.HasKey(e => new { e.user_id, e.product_id }).HasName("Review_pkey");
            entity.ToTable("Review");
            entity.Property(e => e.review_date).HasDefaultValueSql("CURRENT_TIMESTAMP").HasColumnType("timestamp without time zone");
            entity.HasOne(d => d.product).WithMany(p => p.Reviews).HasForeignKey(d => d.product_id).HasConstraintName("Review_product_id_fkey");
            entity.HasOne(d => d.user).WithMany(p => p.Reviews).HasForeignKey(d => d.user_id).HasConstraintName("Review_user_id_fkey");
        });

        modelBuilder.Entity<Ticket>(entity =>
        {
            entity.HasKey(e => e.ticket_id).HasName("Ticket_pkey");
            entity.ToTable("Ticket");
            entity.HasIndex(e => e.product_id, "Ticket_product_id_key").IsUnique();
            entity.Property(e => e.price_category).HasMaxLength(50);
            entity.HasOne(d => d.concert).WithMany(p => p.Tickets).HasForeignKey(d => d.concert_id).HasConstraintName("Ticket_concert_id_fkey");
            entity.HasOne(d => d.product).WithOne(p => p.Ticket).HasForeignKey<Ticket>(d => d.product_id).HasConstraintName("Ticket_product_id_fkey");
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
            entity.Property(e => e.password_hash).HasMaxLength(255).HasDefaultValueSql("''::character varying");
            entity.Property(e => e.registration_date).HasDefaultValueSql("CURRENT_DATE");
        });

        modelBuilder.Entity<Wishlist>(entity =>
        {
            entity.ToTable("Wishlist");
            entity.HasKey(e => new { e.user_id, e.product_id });
        });

        modelBuilder.Entity<ArtistConcert>(entity =>
        {
            entity.ToTable("ArtistConcert");
            entity.HasKey(e => new { e.artist_id, e.concert_id });
            entity.HasOne(e => e.Artist)
                  .WithMany()
                  .HasForeignKey(e => e.artist_id)
                  .HasConstraintName("ArtistConcert_artist_id_fkey");
            entity.HasOne(e => e.Concert)
                  .WithMany(c => c.ArtistConcerts)
                  .HasForeignKey(e => e.concert_id)
                  .HasConstraintName("ArtistConcert_concert_id_fkey");
        });

        modelBuilder.Entity<ArtistMerch>(entity =>
        {
            entity.ToTable("ArtistMerch");
            entity.HasKey(e => new { e.artist_id, e.merch_id });
            entity.HasOne(e => e.Artist)
                  .WithMany(a => a.ArtistMerches)
                  .HasForeignKey(e => e.artist_id)
                  .HasConstraintName("ArtistMerch_artist_id_fkey");
            entity.HasOne(e => e.Merch)
                  .WithMany(m => m.ArtistMerches)
                  .HasForeignKey(e => e.merch_id)
                  .HasConstraintName("ArtistMerch_merch_id_fkey");
        });

        modelBuilder.Entity<ProductGenre>(entity =>
        {
            entity.ToTable("ProductGenre");
            entity.HasKey(e => new { e.product_id, e.genre_id });
            entity.HasOne<Product>().WithMany().HasForeignKey(d => d.product_id).HasConstraintName("ProductGenre_product_id_fkey");
            entity.HasOne<Genre>().WithMany().HasForeignKey(d => d.genre_id).HasConstraintName("ProductGenre_genre_id_fkey");
        });

        modelBuilder.Entity<ChangeLog>(entity =>
        {
            entity.ToTable("ChangeLog");
            entity.HasKey(e => e.log_id);
            entity.Property(e => e.log_id).UseIdentityColumn();
            entity.Property(e => e.table_name).HasMaxLength(100);
            entity.Property(e => e.operation_type).HasMaxLength(20);
            entity.Property(e => e.old_data).HasColumnType("jsonb");
            entity.Property(e => e.new_data).HasColumnType("jsonb");
            entity.Property(e => e.changed_at).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}