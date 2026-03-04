import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    Chip,
    Button,
    Card,
    CardContent,
    CardMedia,
    Grid,
    Breadcrumbs,
    CircularProgress,
    Alert,
    Divider,
    IconButton,
    Paper
} from '@mui/material';
import {
    ThumbUp as LikeIcon,
    ThumbUpOutlined as LikeOutlineIcon,
    Visibility as ViewIcon,
    CalendarToday as CalendarIcon,
    ArrowBack as ArrowBackIcon,
    Share as ShareIcon
} from '@mui/icons-material';
import {
    getCropKnowledgeBySlug,
    getRelatedCropKnowledge,
    toggleLikeCropKnowledge
} from '../../services/cropKnowledgeService';
import { useAuth } from '../../context/AuthContext';

const CropKnowledgeDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [article, setArticle] = useState(null);
    const [relatedArticles, setRelatedArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);

    useEffect(() => {
        const fetchArticle = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await getCropKnowledgeBySlug(slug);
                setArticle(response.data);
                setLikeCount(response.data.likes || 0);
                setIsLiked(response.data.likedBy?.includes(user?._id));

                // Fetch related articles
                if (response.data._id) {
                    const relatedResponse = await getRelatedCropKnowledge(response.data._id, 4);
                    setRelatedArticles(relatedResponse.data || []);
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch article');
            } finally {
                setLoading(false);
            }
        };

        fetchArticle();
    }, [slug, user]);

    const handleLike = async () => {
        if (!user) {
            alert('Please login to like articles');
            return;
        }

        try {
            const response = await toggleLikeCropKnowledge(article._id);
            setLikeCount(response.data.likes);
            setIsLiked(response.data.isLiked);
        } catch (err) {
            console.error('Error toggling like:', err);
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: article.title,
                text: article.content.introduction,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress sx={{ color: '#10B981' }} />
            </Box>
        );
    }

    if (error || !article) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error">{error || 'Article not found'}</Alert>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/resources/crop-knowledge')}
                    sx={{ mt: 2 }}
                >
                    Back to Crop Knowledge
                </Button>
            </Container>
        );
    }

    return (
        <Box sx={{ bgcolor: '#f9fafb', minHeight: '100vh', py: 4 }}>
            <Container maxWidth="lg">
                {/* Breadcrumbs */}
                <Breadcrumbs sx={{ mb: 3 }}>
                    <Link to="/" style={{ textDecoration: 'none', color: '#6B7280' }}>
                        Home
                    </Link>
                    <Link to="/resources/crop-knowledge" style={{ textDecoration: 'none', color: '#6B7280' }}>
                        Crop Knowledge
                    </Link>
                    <Typography color="text.primary">{article.title}</Typography>
                </Breadcrumbs>

                {/* Back Button */}
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/resources/crop-knowledge')}
                    sx={{ mb: 2 }}
                >
                    Back to Articles
                </Button>

                <Grid container spacing={4}>
                    {/* Main Content */}
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 4 }}>
                            {/* Header */}
                            <Box sx={{ mb: 3 }}>
                                <Chip
                                    label={article.category}
                                    sx={{ mb: 2, bgcolor: '#10B981', color: 'white' }}
                                />
                                <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
                                    {article.title}
                                </Typography>

                                {/* Meta Info */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2, color: 'text.secondary' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <ViewIcon fontSize="small" />
                                        <Typography variant="body2">{article.views || 0} views</Typography>
                                    </Box>
                                    {article.publishedAt && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <CalendarIcon fontSize="small" />
                                            <Typography variant="body2">{formatDate(article.publishedAt)}</Typography>
                                        </Box>
                                    )}
                                </Box>

                                {/* Actions */}
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Button
                                        variant={isLiked ? 'contained' : 'outlined'}
                                        startIcon={isLiked ? <LikeIcon /> : <LikeOutlineIcon />}
                                        onClick={handleLike}
                                        sx={{
                                            borderColor: '#10B981',
                                            color: isLiked ? 'white' : '#10B981',
                                            bgcolor: isLiked ? '#10B981' : 'transparent',
                                            '&:hover': {
                                                bgcolor: isLiked ? '#059669' : '#E0F2FE'
                                            }
                                        }}
                                    >
                                        {likeCount} Likes
                                    </Button>
                                    <IconButton onClick={handleShare} sx={{ color: '#10B981' }}>
                                        <ShareIcon />
                                    </IconButton>
                                </Box>
                            </Box>

                            {/* Cover Image */}
                            {article.coverImage && (
                                <Box sx={{ mb: 4 }}>
                                    <img
                                        src={article.coverImage}
                                        alt={article.title}
                                        style={{ width: '100%', borderRadius: '8px' }}
                                    />
                                </Box>
                            )}

                            {/* Introduction */}
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#10B981' }}>
                                Introduction
                            </Typography>
                            <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                                {article.content.introduction}
                            </Typography>

                            <Divider sx={{ my: 3 }} />

                            {/* Cultivation Requirements */}
                            {article.content.cultivation && (
                                <>
                                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
                                        Cultivation Requirements
                                    </Typography>
                                    <Grid container spacing={2} sx={{ mb: 3 }}>
                                        {article.content.cultivation.soilRequirements && (
                                            <Grid item xs={12}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Soil Requirements</Typography>
                                                <Typography variant="body2" paragraph>{article.content.cultivation.soilRequirements}</Typography>
                                            </Grid>
                                        )}
                                        {article.content.cultivation.climate && (
                                            <Grid item xs={12}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Climate</Typography>
                                                <Typography variant="body2" paragraph>{article.content.cultivation.climate}</Typography>
                                            </Grid>
                                        )}
                                        {article.content.cultivation.season && (
                                            <Grid item xs={12}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Season</Typography>
                                                <Typography variant="body2" paragraph>{article.content.cultivation.season}</Typography>
                                            </Grid>
                                        )}
                                        {article.content.cultivation.waterRequirements && (
                                            <Grid item xs={12}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Water Requirements</Typography>
                                                <Typography variant="body2" paragraph>{article.content.cultivation.waterRequirements}</Typography>
                                            </Grid>
                                        )}
                                    </Grid>
                                    <Divider sx={{ my: 3 }} />
                                </>
                            )}

                            {/* Farming Practices */}
                            {article.content.practices && (
                                <>
                                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
                                        Farming Practices
                                    </Typography>
                                    {article.content.practices.landPreparation && (
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Land Preparation</Typography>
                                            <Typography variant="body2" paragraph>{article.content.practices.landPreparation}</Typography>
                                        </Box>
                                    )}
                                    {article.content.practices.sowing && (
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Sowing</Typography>
                                            <Typography variant="body2">Method: {article.content.practices.sowing.method}</Typography>
                                            <Typography variant="body2">Spacing: {article.content.practices.sowing.spacing}</Typography>
                                            <Typography variant="body2" paragraph>Seed Rate: {article.content.practices.sowing.seedRate}</Typography>
                                        </Box>
                                    )}
                                    {article.content.practices.fertilization && (
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Fertilization</Typography>
                                            <Typography variant="body2">NPK Ratio: {article.content.practices.fertilization.npkRatio}</Typography>
                                            <Typography variant="body2">Basal: {article.content.practices.fertilization.basal}</Typography>
                                            <Typography variant="body2" paragraph>Top Dressing: {article.content.practices.fertilization.topDressing}</Typography>
                                        </Box>
                                    )}
                                    <Divider sx={{ my: 3 }} />
                                </>
                            )}

                            {/* Harvest Information */}
                            {article.content.harvest && (
                                <>
                                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
                                        Harvest Information
                                    </Typography>
                                    {article.content.harvest.duration && (
                                        <Typography variant="body2" paragraph>
                                            <strong>Duration:</strong> {article.content.harvest.duration}
                                        </Typography>
                                    )}
                                    {article.content.harvest.harvestingMethod && (
                                        <Typography variant="body2" paragraph>
                                            <strong>Method:</strong> {article.content.harvest.harvestingMethod}
                                        </Typography>
                                    )}
                                    {article.content.harvest.expectedYield && (
                                        <Typography variant="body2" paragraph>
                                            <strong>Expected Yield:</strong> {article.content.harvest.expectedYield.min}-{article.content.harvest.expectedYield.max} {article.content.harvest.expectedYield.unit}
                                        </Typography>
                                    )}
                                    <Divider sx={{ my: 3 }} />
                                </>
                            )}

                            {/* Tags */}
                            {article.tags && article.tags.length > 0 && (
                                <Box sx={{ mt: 4 }}>
                                    <Typography variant="subtitle2" gutterBottom>Tags:</Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {article.tags.map((tag, index) => (
                                            <Chip key={index} label={tag} size="small" variant="outlined" />
                                        ))}
                                    </Box>
                                </Box>
                            )}
                        </Paper>
                    </Grid>

                    {/* Sidebar */}
                    <Grid item xs={12} md={4}>
                        {/* Related Articles */}
                        {relatedArticles.length > 0 && (
                            <Paper sx={{ p: 3, mb: 3 }}>
                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                    Related Articles
                                </Typography>
                                {relatedArticles.map((related) => (
                                    <Card
                                        key={related._id}
                                        sx={{ mb: 2, cursor: 'pointer' }}
                                        component={Link}
                                        to={`/resources/crop-knowledge/${related.slug}`}
                                        style={{ textDecoration: 'none' }}
                                    >
                                        <CardMedia
                                            component="img"
                                            height="120"
                                            image={related.coverImage || 'https://via.placeholder.com/300x120'}
                                            alt={related.title}
                                        />
                                        <CardContent>
                                            <Chip label={related.category} size="small" sx={{ mb: 1 }} />
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                {related.title}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                ))}
                            </Paper>
                        )}
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default CropKnowledgeDetail;
