using System;
using System.Collections.Generic;

namespace MusicMarketplace.Models;

public partial class Artist
{
    public int artist_id { get; set; }

    public string name { get; set; } = null!;

    public string? country { get; set; }

    public int? debut_year { get; set; }

    public virtual ICollection<Concert> concerts { get; set; } = new List<Concert>();

    public virtual ICollection<Merch> merches { get; set; } = new List<Merch>();
}
