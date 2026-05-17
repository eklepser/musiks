using System;
using System.Collections.Generic;

namespace MusicMarketplace.Models;

public partial class Genre
{
    public int genre_id { get; set; }

    public string name { get; set; } = null!;

    public virtual ICollection<Product> products { get; set; } = new List<Product>();
}
