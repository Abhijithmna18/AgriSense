import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
    Container,
    Grid,
    Card,
    CardContent,
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
    Tab,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';
import {
    Search as SearchIcon,
    Visibility as ViewIcon,
    ThumbUp as ThumbUpIcon,
    ExpandMore as ExpandMoreIcon,
    HelpOutline as HelpIcon,
    MenuBook as GuideIcon,
    School as TutorialIcon,
    Build as TroubleshootIcon,
    Description as DocIcon
} from '@mui/icons-material';
import {
    getAllHelpArticles,
    getCategories,
    getFeaturedHelpArticles,
    searchHelpArticles
} from '../../services/helpCenterService';

const TYPE_ICONS = {
    faq: <HelpIcon />,
    guide: <GuideIcon />,
    tutorial: <TutorialIcon />,
    troubleshooting: <TroubleshootIcon />,
    documentation: <DocIcon />
};

const TYPE_COLORS = {
    faq: '#3B82F6',
    guide: '#10B981',
    tutorial: '#F59E0B',
    troubleshooting: '#EF4444',
    documentation: '#8B5CF6'
};

const HelpCenter = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [articles, setArticles] = useState([]);
    const [featuredArticles, setFeaturedArticles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

    const currentPage = parseInt(searchParams.get('page')) || 1;
    const currentType = searchParams.get('type') || 'all';
    const currentCategory = searchParams.get('category') || 'all';
    const searchQuery = searchParams.get('search') || '';

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

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const response = await getFeaturedHelpArticles(4);
                setFeaturedArticles(response.data || []);
            } catch (err) {
                console.error('Error fetching featured articles:', err);
            }
        };
        fetchFeatured();
    }, []);

    useEffect(() => {
        const fetchArticles = async () => {
            setLoading(true);
            setError(null);

            try {
                let response;
                const params = { page: currentPage, limit: 12 };

                if (searchQuery) {
                    response = await searchHelpArticles(searchQuery, params);
                } else {
                    if (currentType !== 'all') params.type = currentType;
                    if (currentCategory !== 'all') params.category = currentCategory;
                    response = await getAllHelpArticles(params);
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
    }, [currentPage, currentType, currentCategory, searchQuery]);

    const handleSearch = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const query = formData.get('search');
        
        if (query.trim()) {
            setSearchParams({ search: query, page: 1 });
        } else {
            setSearchParams({ type: currentType, category: currentCategory, page: 1 });
        }
    };

    const handleTypeChange = (event, newValue) => {
        setSearchParams({ type: newValue, page: 1 });
    };

    const handlePageChange = (event, value) => {
        const params = { page: value };
        if (currentType !== 'all') params.type = currentType;
        if (currentCategory !== 'all') params.category = currentCategory;
        if (searchQuery) params.search = searchQuery;
        setSearchParams(params);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <Box sx={{ bgcolor: '#f9fafb', minHeight: '100vh', py: 4 }}>
            <Container maxWidth="lg">
                {/* Header */}
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                    <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, color: '#111827' }}>
                        Help Center
                    </Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                        Find answers, guides, and tutorials to help you get the most out of AgriSense
                    </Typography>

                    {/* Search Bar */}
                    <Box component="form" onSubmit={handleSearch} sx={{ maxWidth: 600, mx: 'auto' }}>
                        <TextField
                            fullWidth
                            name="search"
                            placeholder="Search for help articles, FAQs, guides..."
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

                {/* Featured FAQs */}
                {!searchQuery && featuredArticles.length > 0 && (
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                            Popular Questions
                        </Typography>
                        {featuredArticles.filter(a => a.type === 'faq').map((article) => (
                            <Accordion key={article._id} sx={{ mb: 1 }}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                                        {article.title}
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Typography variant="body2" color="text.secondary">
                                        {article.content?.summary || 'Click to view full answer'}
                                    </Typography>
                                    <Button
                                        component={Link}
                                        to={`/resources/help/${article.slug}`}
                                        size="small"
                                        sx={{ mt: 1, color: '#10B981' }}
                                    >
                                        View Full Answer
                                    </Button>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </Box>
                )}

                {/* Type Tabs */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs
                        value={currentType}
                        onChange={handleTypeChange}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{
                            '& .MuiTab-root': { textTransform: 'none', fontWeight: 500 },
                            '& .Mui-selected': { color: '#10B981' },
                            '& .MuiTabs-indicator': { bgcolor: '#10B981' }
                        }}
                    >
                        <Tab label="All" value="all" />
                        <Tab label="FAQs" value="faq" icon={<HelpIcon />} iconPosition="start" />
                        <Tab label="Guides" value="guide" icon={<GuideIcon />} iconPosition="start" />
                        <Tab label="Tutorials" value="tutorial" icon={<TutorialIcon />} iconPosition="start" />
                        <Tab label="Troubleshooting" value="troubleshooting" icon={<TroubleshootIcon />} iconPosition="start" />
                        <Tab label="Documentation" value="documentation" icon={<DocIcon />} iconPosition="start" />
                    </Tabs>
                </Box>

                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress sx={{ color: '#10B981' }} />
                    </Box>
                )}

                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

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
                                                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                        <Box sx={{ color: TYPE_COLORS[article.type] }}>
                                                            {TYPE_ICONS[article.type]}
                                                        </Box>
                                                        <Chip
                                                            label={article.type}
                                                            size="small"
                                                            sx={{ bgcolor: TYPE_COLORS[article.type], color: 'white', textTransform: 'capitalize' }}
                                                        />
                                                        <Chip label={article.category} size="small" variant="outlined" />
                                                    </Box>
                                                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                                        {article.title}
                                                    </Typography>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{ mb: 2, flexGrow: 1 }}
                                                    >
                                                        {article.content?.summary || article.content?.question || article.title}
                                                    </Typography>

                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, fontSize: '0.875rem', color: 'text.secondary' }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <ViewIcon fontSize="small" />
                                                            <span>{article.views || 0}</span>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <ThumbUpIcon fontSize="small" />
                                                            <span>{article.helpful || 0}</span>
                                                        </Box>
                                                    </Box>

                                                    <Button
                                                        component={Link}
                                                        to={`/resources/help/${article.slug}`}
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

export default HelpCenter;
