import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
    Container,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Typography,
    Box,
    Chip,
    TextField,
    InputAdornment,
    Pagination,
    CircularProgress,
    Alert,
    Button,
    Tabs,
    Tab
} from '@mui/material';
import {
    Search as SearchIcon,
    Visibility as ViewIcon,
    ThumbUp as LikeIcon,
    CalendarToday as CalendarIcon
} from '@mui/icons-material';
import {
    getAllCropKnowledge,
    getCategories,
    getFeaturedCropKnowledge,
    searchCropKnowledge
} from '../../services/cropKnowledgeService';

const CropKnowledge = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [articles, setArticles] = useState([]);
    const [featuredArticles, setFeaturedArticles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        pages: 1,
        total: 0
    });

    // Get query params
    const currentPage = parseInt(searchParams.get('page')) || 1;
    const currentCategory = searchParams.get('category') || 'all';
    const searchQuery = searchParams.get('search') || '';

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await getCategories();
                setCategories(response.data || []);
            } catch (err) {
                console.error('Error fetching categories:', err);
            }
        };
        fetchCategories();
    }, []);

    // Fetch featured articles
    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const response = await getFeaturedCropKnowledge(3);
                setFeaturedArticles(response.data || []);
            } catch (err) {
                console.error('Error fetching featured articles:', err);
            }
        };
        fetchFeatured();
    }, []);

    // Fetch articles
    useEffect(() => {
        const fetchArticles = async () => {
            setLoading(true);
            setError(null);

            try {
                let response;
                const params = {
                    page: currentPage,
                    limit: 12
                };

                if (searchQuery) {
                    response = await searchCropKnowledge(searchQuery, params);
                } else {
                    if (currentCategory !== 'all') {
                        params.category = currentCategory;
                    }
                    response = await getAllCropKnowledge(params);
                }

                setArticles(response.data || []);
                setPagination({
                    page: response.page || 1,
                    pages: response.pages || 1,
                    total: response.total || 0
                });
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch articles');
            } finally {
                setLoading(false);
            }
        };

        fetchArticles();
    }, [currentPage, currentCategory, searchQuery]);

    // Handle search
    const handleSearch = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const query = formData.get('search');
        
        if (query.trim()) {
            setSearchParams({ search: query, page: 1 });
        } else {
            setSearchParams({ category: currentCategory, page: 1 });
        }
    };

    // Handle category change
    const handleCategoryChange = (event, newValue) => {
        setSearchParams({ category: newValue, page: 1 });
    };

    // Handle page change
    const handlePageChange = (event, value) => {
        const params = { page: value };
        if (currentCategory !== 'all') params.category = currentCategory;
        if (searchQuery) params.search = searchQuery;
        setSearchParams(params);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <Box sx={{ bgcolor: '#f9fafb', minHeight: '100vh', py: 4 }}>
            <Container maxWidth="lg">
                {/* Header */}
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                    <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, color: '#111827' }}>
                        Crop Knowledge
                    </Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                        Comprehensive guides on crop cultivation, management, and best practices
                    </Typography>

                    {/* Search Bar */}
                    <Box component="form" onSubmit={handleSearch} sx={{ maxWidth: 600, mx: 'auto' }}>
                        <TextField
                            fullWidth
                            name="search"
                            placeholder="Search crops, practices, techniques..."
                            defaultValue={searchQuery}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Button type="submit" variant="contained" sx={{ bgcolor: '#10B981' }}>
                                            Search
                                        </Button>
                                    </InputAdornment>
                                )
                            }}
                            sx={{ bgcolor: 'white' }}
                        />
                    </Box>
                </Box>

                {/* Featured Articles */}
                {!searchQuery && featuredArticles.length > 0 && (
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                            Featured Articles
                        </Typography>
                        <Grid container spacing={3}>
                            {featuredArticles.map((article) => (
                                <Grid item xs={12} md={4} key={article._id}>
                                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                        <CardMedia
                                            component="img"
                                            height="200"
                                            image={article.coverImage || 'https://via.placeholder.com/400x200?text=Crop+Knowledge'}
                                            alt={article.title}
                                        />
                                        <CardContent sx={{ flexGrow: 1 }}>
                                            <Chip label={article.category} size="small" sx={{ mb: 1, bgcolor: '#10B981', color: 'white' }} />
                                            <Typography variant="h6" gutterBottom>
                                                {article.title}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                {article.content?.introduction?.substring(0, 120)}...
                                            </Typography>
                                            <Button
                                                component={Link}
                                                to={`/resources/crop-knowledge/${article.slug}`}
                                                variant="outlined"
                                                size="small"
                                                sx={{ borderColor: '#10B981', color: '#10B981' }}
                                            >
                                                Read More
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}

                {/* Category Tabs */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs
                        value={currentCategory}
                        onChange={handleCategoryChange}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{
                            '& .MuiTab-root': { textTransform: 'none', fontWeight: 500 },
                            '& .Mui-selected': { color: '#10B981' },
                            '& .MuiTabs-indicator': { bgcolor: '#10B981' }
                        }}
                    >
                        <Tab label="All Categories" value="all" />
                        {categories.map((cat) => (
                            <Tab
                                key={cat.category}
                                label={`${cat.category} (${cat.count})`}
                                value={cat.category}
                            />
                        ))}
                    </Tabs>
                </Box>

                {/* Loading State */}
                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress sx={{ color: '#10B981' }} />
                    </Box>
                )}

                {/* Error State */}
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {/* Articles Grid */}
                {!loading && !error && (
                    <>
                        {articles.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 8 }}>
                                <Typography variant="h6" color="text.secondary">
                                    No articles found
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    Try adjusting your search or filters
                                </Typography>
                            </Box>
                        ) : (
                            <>
                                <Grid container spacing={3}>
                                    {articles.map((article) => (
                                        <Grid item xs={12} sm={6} md={4} key={article._id}>
                                            <Card
                                                sx={{
                                                    height: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                                    '&:hover': {
                                                        transform: 'translateY(-4px)',
                                                        boxShadow: 4
                                                    }
                                                }}
                                            >
                                                <CardMedia
                                                    component="img"
                                                    height="180"
                                                    image={article.coverImage || 'https://via.placeholder.com/400x180?text=Crop'}
                                                    alt={article.title}
                                                />
                                                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                                    <Box sx={{ mb: 1 }}>
                                                        <Chip
                                                            label={article.category}
                                                            size="small"
                                                            sx={{ bgcolor: '#E0F2FE', color: '#0369A1' }}
                                                        />
                                                    </Box>
                                                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                                        {article.title}
                                                    </Typography>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{ mb: 2, flexGrow: 1 }}
                                                    >
                                                        {article.content?.introduction?.substring(0, 100)}...
                                                    </Typography>

                                                    {/* Meta Info */}
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, fontSize: '0.875rem', color: 'text.secondary' }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <ViewIcon fontSize="small" />
                                                            <span>{article.views || 0}</span>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <LikeIcon fontSize="small" />
                                                            <span>{article.likes || 0}</span>
                                                        </Box>
                                                        {article.publishedAt && (
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                <CalendarIcon fontSize="small" />
                                                                <span>{formatDate(article.publishedAt)}</span>
                                                            </Box>
                                                        )}
                                                    </Box>

                                                    <Button
                                                        component={Link}
                                                        to={`/resources/crop-knowledge/${article.slug}`}
                                                        variant="contained"
                                                        fullWidth
                                                        sx={{ bgcolor: '#10B981', '&:hover': { bgcolor: '#059669' } }}
                                                    >
                                                        Read Article
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>

                                {/* Pagination */}
                                {pagination.pages > 1 && (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                                        <Pagination
                                            count={pagination.pages}
                                            page={pagination.page}
                                            onChange={handlePageChange}
                                            color="primary"
                                            size="large"
                                            sx={{
                                                '& .MuiPaginationItem-root': {
                                                    '&.Mui-selected': {
                                                        bgcolor: '#10B981',
                                                        '&:hover': { bgcolor: '#059669' }
                                                    }
                                                }
                                            }}
                                        />
                                    </Box>
                                )}

                                {/* Results Info */}
                                <Box sx={{ textAlign: 'center', mt: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Showing {articles.length} of {pagination.total} articles
                                    </Typography>
                                </Box>
                            </>
                        )}
                    </>
                )}
            </Container>
        </Box>
    );
};

export default CropKnowledge;
