using Microsoft.EntityFrameworkCore;
using RecipeHub.Api.Data;
using RecipeHub.Api.Dtos;
using RecipeHub.Api.Models;

namespace RecipeHub.Api.Endpoints;

public static class FavoriteEndpoints
{
    private const string DefaultUserId = "default-user";

    public static void MapFavoriteEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/favorites").WithTags("Favorites");

        group.MapGet("/", GetAllAsync);
        group.MapPost("/", CreateAsync);
        group.MapDelete("/{recipeId:int}", DeleteAsync);
    }

    private static async Task<IResult> GetAllAsync(
        string? userId,
        RecipeDbContext db,
        CancellationToken ct)
    {
        var normalizedUserId = NormalizeUserId(userId);

        var favorites = await db.Favorites
            .AsNoTracking()
            .Where(f => f.UserId == normalizedUserId)
            .Include(f => f.Recipe!)
                .ThenInclude(r => r.RecipeTags)
                    .ThenInclude(rt => rt.Tag)
            .OrderByDescending(f => f.CreatedAt)
            .ThenByDescending(f => f.Id)
            .ToListAsync(ct);

        var dtos = favorites
            .Select(ToDto)
            .ToArray();

        return Results.Ok(dtos);
    }

    private static async Task<IResult> CreateAsync(
        AddFavoriteRequest request,
        RecipeDbContext db,
        CancellationToken ct)
    {
        var userId = NormalizeUserId(request.UserId);

        var recipe = await db.Recipes
            .Include(r => r.RecipeTags)
                .ThenInclude(rt => rt.Tag)
            .FirstOrDefaultAsync(r => r.Id == request.RecipeId, ct);

        if (recipe is null)
        {
            return Results.NotFound();
        }

        var exists = await db.Favorites
            .AsNoTracking()
            .AnyAsync(f => f.UserId == userId && f.RecipeId == request.RecipeId, ct);

        if (exists)
        {
            return Results.Conflict(new { message = "Recipe is already favorited for this user." });
        }

        var favorite = new Favorite
        {
            UserId = userId,
            RecipeId = recipe.Id,
            CreatedAt = DateTime.UtcNow,
            Recipe = recipe
        };

        db.Favorites.Add(favorite);
        await db.SaveChangesAsync(ct);

        return Results.Created($"/api/favorites/{favorite.RecipeId}?userId={Uri.EscapeDataString(userId)}", ToDto(favorite));
    }

    private static async Task<IResult> DeleteAsync(
        int recipeId,
        string? userId,
        RecipeDbContext db,
        CancellationToken ct)
    {
        var normalizedUserId = NormalizeUserId(userId);

        var favorite = await db.Favorites
            .FirstOrDefaultAsync(f => f.UserId == normalizedUserId && f.RecipeId == recipeId, ct);

        if (favorite is null)
        {
            return Results.NotFound();
        }

        db.Favorites.Remove(favorite);
        await db.SaveChangesAsync(ct);

        return Results.NoContent();
    }

    private static FavoriteDto ToDto(Favorite favorite)
    {
        var recipe = favorite.Recipe ?? throw new InvalidOperationException("Favorite recipe was not loaded.");

        return new FavoriteDto(
            recipe.Id,
            recipe.Title,
            recipe.Description,
            recipe.Difficulty.ToString(),
            recipe.PrepTimeMinutes,
            recipe.CookTimeMinutes,
            recipe.Servings,
            recipe.ImageUrl,
            recipe.RecipeTags
                .Where(rt => rt.Tag is not null)
                .Select(rt => rt.Tag!.Name)
                .OrderBy(name => name)
                .ToArray(),
            favorite.CreatedAt
        );
    }

    private static string NormalizeUserId(string? userId)
        => string.IsNullOrWhiteSpace(userId) ? DefaultUserId : userId.Trim();
}
