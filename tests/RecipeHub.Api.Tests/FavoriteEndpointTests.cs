using System.Net;
using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace RecipeHub.Api.Tests;

public class FavoriteEndpointTests : IClassFixture<RecipeApiFactory>
{
    private const string DefaultUserId = "default-user";
    private readonly RecipeApiFactory _factory;

    public FavoriteEndpointTests(RecipeApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GetFavorites_ReturnsEmptyArray_WhenNoFavorites()
    {
        var client = _factory.CreateClient();
        var userId = CreateUserId();

        var response = await client.GetAsync(GetFavoritesUrl(userId));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var favorites = await response.Content.ReadFromJsonAsync<FavoriteDto[]>();
        Assert.NotNull(favorites);
        Assert.Empty(favorites!);
    }

    [Fact]
    public async Task PostFavorite_Returns201_WhenRecipeExistsAndNotAlreadyFavorited()
    {
        var client = _factory.CreateClient();
        var userId = CreateUserId();

        var response = await AddFavoriteAsync(client, userId, recipeId: 1);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var favorite = await response.Content.ReadFromJsonAsync<FavoriteDto>();
        Assert.NotNull(favorite);
        Assert.Equal("Classic Margherita Pizza", favorite!.Title);
        Assert.NotEqual(default, favorite.FavoritedAt);
    }

    [Fact]
    public async Task PostFavorite_ReturnsFavoriteDtoWithRecipeDetails()
    {
        var client = _factory.CreateClient();
        var userId = CreateUserId();
        var expected = await GetRecipeSnapshotAsync(recipeId: 1);

        var response = await AddFavoriteAsync(client, userId, recipeId: 1);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var favorite = await response.Content.ReadFromJsonAsync<FavoriteDto>();
        Assert.NotNull(favorite);
        Assert.Equal(expected.Title, favorite!.Title);
        Assert.Equal(expected.Description, favorite.Description);
        Assert.Equal(expected.Difficulty, favorite.Difficulty);
        Assert.Equal(expected.PrepTimeMinutes, favorite.PrepTimeMinutes);
        Assert.Equal(expected.CookTimeMinutes, favorite.CookTimeMinutes);
        Assert.Equal(expected.Servings, favorite.Servings);
        Assert.Equal(expected.ImageUrl, favorite.ImageUrl);
        Assert.Equal(expected.TagNames, favorite.TagNames.OrderBy(name => name).ToArray());
        Assert.NotEqual(default, favorite.FavoritedAt);
    }

    [Fact]
    public async Task GetFavorites_ReturnsFavorites_AfterAdding()
    {
        var client = _factory.CreateClient();
        var userId = CreateUserId();

        var postResponse = await AddFavoriteAsync(client, userId, recipeId: 1);
        Assert.Equal(HttpStatusCode.Created, postResponse.StatusCode);

        var getResponse = await client.GetAsync(GetFavoritesUrl(userId));

        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);
        var favorites = await getResponse.Content.ReadFromJsonAsync<FavoriteDto[]>();
        Assert.NotNull(favorites);
        var favorite = Assert.Single(favorites!);
        Assert.Equal("Classic Margherita Pizza", favorite.Title);
        Assert.NotEqual(default, favorite.FavoritedAt);
    }

    [Fact]
    public async Task DeleteFavorite_Returns204_WhenFavoriteExists()
    {
        var client = _factory.CreateClient();
        var userId = CreateUserId();

        var postResponse = await AddFavoriteAsync(client, userId, recipeId: 1);
        Assert.Equal(HttpStatusCode.Created, postResponse.StatusCode);

        var deleteResponse = await client.DeleteAsync(DeleteFavoriteUrl(recipeId: 1, userId));

        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);
    }

    [Fact]
    public async Task GetFavorites_ReturnsEmpty_AfterDeletion()
    {
        var client = _factory.CreateClient();
        var userId = CreateUserId();

        var postResponse = await AddFavoriteAsync(client, userId, recipeId: 1);
        Assert.Equal(HttpStatusCode.Created, postResponse.StatusCode);

        var deleteResponse = await client.DeleteAsync(DeleteFavoriteUrl(recipeId: 1, userId));
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

        var getResponse = await client.GetAsync(GetFavoritesUrl(userId));

        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);
        var favorites = await getResponse.Content.ReadFromJsonAsync<FavoriteDto[]>();
        Assert.NotNull(favorites);
        Assert.Empty(favorites!);
    }

    [Fact]
    public async Task PostFavorite_Returns404_WhenRecipeDoesNotExist()
    {
        var client = _factory.CreateClient();
        var userId = CreateUserId();

        var response = await AddFavoriteAsync(client, userId, recipeId: 99999);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task PostFavorite_Returns409_WhenAlreadyFavorited()
    {
        var client = _factory.CreateClient();
        var userId = CreateUserId();

        var firstResponse = await AddFavoriteAsync(client, userId, recipeId: 1);
        Assert.Equal(HttpStatusCode.Created, firstResponse.StatusCode);

        var secondResponse = await AddFavoriteAsync(client, userId, recipeId: 1);

        Assert.Equal(HttpStatusCode.Conflict, secondResponse.StatusCode);
    }

    [Fact]
    public async Task DeleteFavorite_Returns404_WhenFavoriteDoesNotExist()
    {
        var client = _factory.CreateClient();
        var userId = CreateUserId();

        var response = await client.DeleteAsync(DeleteFavoriteUrl(recipeId: 1, userId));

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task GetFavorites_DefaultsToDefaultUser_WhenNoUserIdProvided()
    {
        var client = _factory.CreateClient();

        var postResponse = await AddFavoriteAsync(client, DefaultUserId, recipeId: 2);
        Assert.Equal(HttpStatusCode.Created, postResponse.StatusCode);

        var getResponse = await client.GetAsync("/api/favorites");

        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);
        var favorites = await getResponse.Content.ReadFromJsonAsync<FavoriteDto[]>();
        Assert.NotNull(favorites);
        var favorite = Assert.Single(favorites!);
        Assert.Equal("Fluffy Pancakes", favorite.Title);
    }

    [Fact]
    public async Task GetFavorites_ReturnsOnlyUsersFavorites()
    {
        var client = _factory.CreateClient();
        var userA = CreateUserId();
        var userB = CreateUserId();

        var userAPost = await AddFavoriteAsync(client, userA, recipeId: 1);
        var userBPost = await AddFavoriteAsync(client, userB, recipeId: 2);
        Assert.Equal(HttpStatusCode.Created, userAPost.StatusCode);
        Assert.Equal(HttpStatusCode.Created, userBPost.StatusCode);

        var userAResponse = await client.GetAsync(GetFavoritesUrl(userA));
        var userBResponse = await client.GetAsync(GetFavoritesUrl(userB));

        Assert.Equal(HttpStatusCode.OK, userAResponse.StatusCode);
        Assert.Equal(HttpStatusCode.OK, userBResponse.StatusCode);

        var userAFavorites = await userAResponse.Content.ReadFromJsonAsync<FavoriteDto[]>();
        var userBFavorites = await userBResponse.Content.ReadFromJsonAsync<FavoriteDto[]>();

        Assert.NotNull(userAFavorites);
        Assert.NotNull(userBFavorites);

        var userAFavorite = Assert.Single(userAFavorites!);
        var userBFavorite = Assert.Single(userBFavorites!);

        Assert.Equal("Classic Margherita Pizza", userAFavorite.Title);
        Assert.Equal("Fluffy Pancakes", userBFavorite.Title);
        Assert.DoesNotContain(userAFavorites, favorite => favorite.Title == "Fluffy Pancakes");
        Assert.DoesNotContain(userBFavorites, favorite => favorite.Title == "Classic Margherita Pizza");
    }

    [Fact]
    public async Task DeleteFavorite_OnlyDeletesForSpecifiedUser()
    {
        var client = _factory.CreateClient();
        var userA = CreateUserId();
        var userB = CreateUserId();

        var postResponse = await AddFavoriteAsync(client, userA, recipeId: 1);
        Assert.Equal(HttpStatusCode.Created, postResponse.StatusCode);

        var deleteResponse = await client.DeleteAsync(DeleteFavoriteUrl(recipeId: 1, userB));

        Assert.Equal(HttpStatusCode.NotFound, deleteResponse.StatusCode);

        var getResponse = await client.GetAsync(GetFavoritesUrl(userA));
        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);
        var favorites = await getResponse.Content.ReadFromJsonAsync<FavoriteDto[]>();
        Assert.NotNull(favorites);
        Assert.Single(favorites!);
    }

    private static string CreateUserId()
        => $"favorite-tests-{Guid.NewGuid():N}";

    private static string GetFavoritesUrl(string userId)
        => $"/api/favorites?userId={Uri.EscapeDataString(userId)}";

    private static string DeleteFavoriteUrl(int recipeId, string userId)
        => $"/api/favorites/{recipeId}?userId={Uri.EscapeDataString(userId)}";

    private static AddFavoriteRequest CreateRequest(string userId, int recipeId)
        => new(userId, recipeId);

    private async Task<HttpResponseMessage> AddFavoriteAsync(HttpClient client, string userId, int recipeId)
        => await client.PostAsJsonAsync("/api/favorites", CreateRequest(userId, recipeId));

    private async Task<RecipeSnapshot> GetRecipeSnapshotAsync(int recipeId)
    {
        await using var db = _factory.CreateDbContext();

        var recipe = await db.Recipes
            .AsNoTracking()
            .Include(current => current.RecipeTags)
                .ThenInclude(link => link.Tag)
            .SingleAsync(current => current.Id == recipeId);

        return new RecipeSnapshot(
            recipe.Title,
            recipe.Description,
            recipe.Difficulty.ToString(),
            recipe.PrepTimeMinutes,
            recipe.CookTimeMinutes,
            recipe.Servings,
            recipe.ImageUrl,
            recipe.RecipeTags
                .Where(link => link.Tag != null)
                .Select(link => link.Tag!.Name)
                .OrderBy(name => name)
                .ToArray());
    }

    private sealed record AddFavoriteRequest(string UserId, int RecipeId);

    private sealed record RecipeSnapshot(
        string Title,
        string? Description,
        string Difficulty,
        int PrepTimeMinutes,
        int CookTimeMinutes,
        int Servings,
        string? ImageUrl,
        string[] TagNames);

    private sealed class FavoriteDto
    {
        public string Title { get; init; } = string.Empty;
        public string? Description { get; init; }
        public string Difficulty { get; init; } = string.Empty;
        public int PrepTimeMinutes { get; init; }
        public int CookTimeMinutes { get; init; }
        public int Servings { get; init; }
        public string? ImageUrl { get; init; }
        public string[] TagNames { get; init; } = Array.Empty<string>();
        public DateTime FavoritedAt { get; init; }
    }
}
