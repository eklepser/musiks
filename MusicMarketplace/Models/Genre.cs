using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace MusicMarketplace.Models;

public partial class Genre
{
    public int genre_id { get; set; }

    public string name { get; set; } = null!;

    public string? description { get; set; }

    [NotMapped]
    public virtual ICollection<Product> products { get; set; } = new List<Product>();
}
