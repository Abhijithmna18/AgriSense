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
    Paper,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Stepper,
    Step,
    StepLabel,
    StepContent
} from '@mui/material';
import {
    ThumbUp as ThumbUpIcon,
    ThumbUpOutlined as ThumbUpOutlineIcon,
    ThumbDown as ThumbDownIcon,
    ThumbDownOutlined as ThumbDownOutlineIcon,
    Visibility as ViewIcon,
    ArrowBack as ArrowBackIcon,
    Share as ShareIcon,
    CheckCircle as CheckIcon,
    Warning as WarningIcon,
    Lightbulb as TipIcon,
    Error as ErrorIcon,
    HelpOutline as HelpIcon,
    MenuBook as GuideIcon,
    School as TutorialIcon,
    Build as TroubleshootIcon,
    Description as DocIcon
} from '@mui/icons-material';
import {
    getHelpArticleBySlug,
    getRelatedHelpArticles,
    markHelpful,
    markNotHelpful
} from '../../services/helpCenterService';
import { useAuth } from '../../context/AuthContext';

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

const HelpCenterDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [article, setArticle] = useState(null);
    const [relatedArticles, setRelatedArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userVote, setUserVote] = useState(null);
    const [helpfulCount, setHelpfulCount] = useState(0);
    const [notHelpfulCount, setNotHelpfulCount] = useState(0);

    useEffect(() => {
        const fetchArticle = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await getHelpArticleBySlug(slug);
                setArticle(response.data);
                setHelpfulCount(response.data.helpful || 0);
                setNotHelpfulCount(response.data.notHelpful || 0);

                // Check if user has voted
                if (user) {
                    if (response.data.helpfulBy?.includes(user._id)) {
                        setUserVote('helpful');
                    } else if (response.data.notHelpfulBy?.includes(user._id)) {
                        setUserVote('notHelpful');
                    }
                }

                // Fetch related articles
                if (response.data._id) {
                    const relatedResponse = await getRelatedHelpArticles(response.data._id, 4);
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

    const handleVote = async (voteType) => {
        if (!user) {
            alert('Please login to vote');
            return;
        }

        try {
            let response;
            if (voteType === 'helpful') {
                response = await markHelpful(article._id);
            } else {
                response = await markNotHelpful(article._id);
            }

            setHelpfulCount(response.data.helpful);
            setNotHelpfulCount(response.data.notHelpful);
            setUserVote(voteType);
        } catch (err) {
            console.error('Error voting:', err);
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: article.title,
                text: article.content.summary || article.content.question,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'beginner': return '#10B981';
            case 'intermediate': return '#F59E0B';
            case 'advanced': return '#EF4444';
            default: return '#6B7280';
        }
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
                    onClick={() => navigate('/resources/help')}
                    sx={{ mt: 2 }}
                >
                    Back to Help Center
                </Button>
            </Container>
        );
    }

    const helpfulnessScore = helpfulCount + notHelpfulCount > 0
        ? Math.round((helpfulCount / (helpfulCount + notHelpfulCount)) * 100)
        : 0;

    return (
        <Box sx={{ bgcolor: '#f9fafb', minHeight: '100vh', py: 4 }}>
            <Container maxWidth="lg">
                {/* Breadcrumbs */}
                <Breadcrumbs sx={{ mb: 3 }}>
                    <Link to="/" style={{ textDecoration: 'none', color: '#6B7280' }}>Home</Link>
                    <Link to="/resources/help" style={{ textDecoration: 'none', color: '#6B7280' }}>Help Center</Link>
                    <Typography color="text.primary">{article.title}</Typography>
                </Breadcrumbs>

                {/* Back Button */}
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/resources/help')}
                    sx={{ mb: 2 }}
                >
                    Back to Help Center
                </Button>

                <Grid container spacing={4}>
                    {/* Main Content */}
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 4 }}>
                            {/* Header */}
                            <Box sx={{ mb: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <Box sx={{ color: TYPE_COLORS[article.type] }}>
                                        {TYPE_ICONS[article.type]}
                                    </Box>
                                    <Chip
                                        label={article.type}
                                        sx={{ bgcolor: TYPE_COLORS[article.type], color: 'white', textTransform: 'capitalize' }}
                                    />
                                    <Chip label={article.category} variant="outlined" />
                                    {article.difficulty && (
                                        <Chip
                                            label={article.difficulty}
                                            size="small"
                                            sx={{ bgcolor: getDifficultyColor(article.difficulty), color: 'white', textTransform: 'capitalize' }}
                                        />
                                    )}
                                </Box>

                                <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
                                    {article.title}
                                </Typography>

                                {/* Meta Info */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2, color: 'text.secondary' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <ViewIcon fontSize="small" />
                                        <Typography variant="body2">{article.views || 0} views</Typography>
                                    </Box>
                                    {article.estimatedTime && (
                                        <Typography variant="body2">⏱️ {article.estimatedTime}</Typography>
                                    )}
                                    <Typography variant="body2">
                                        {helpfulnessScore}% found this helpful
                                    </Typography>
                                </Box>
                            </Box>

                            <Divider sx={{ my: 3 }} />

                            {/* FAQ Content */}
                            {article.type === 'faq' && (
                                <>
                                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#3B82F6' }}>
                                        Question
                                    </Typography>
                                    <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', mb: 3 }}>
                                        {article.content.question}
                                    </Typography>

                                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#10B981' }}>
                                        Answer
                                    </Typography>
                                    <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                                        {article.content.answer}
                                    </Typography>
                                </>
                            )}

                            {/* Guide/Tutorial/Documentation Content */}
                            {(article.type === 'guide' || article.type === 'tutorial' || article.type === 'documentation') && (
                                <>
                                    {article.content.summary && (
                                        <>
                                            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                                                Overview
                                            </Typography>
                                            <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                                                {article.content.summary}
                                            </Typography>
                                            <Divider sx={{ my: 3 }} />
                                        </>
                                    )}

                                    {article.content.prerequisites && article.content.prerequisites.length > 0 && (
                                        <>
                                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                                Prerequisites
                                            </Typography>
                                            <List>
                                                {article.content.prerequisites.map((prereq, index) => (
                                                    <ListItem key={index}>
                                                        <ListItemIcon>
                                                            <CheckIcon sx={{ color: '#10B981' }} />
                                                        </ListItemIcon>
                                                        <ListItemText primary={prereq} />
                                                    </ListItem>
                                                ))}
                                            </List>
                                            <Divider sx={{ my: 3 }} />
                                        </>
                                    )}

                                    {article.content.body && (
                                        <>
                                            <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                                                {article.content.body}
                                            </Typography>
                                            <Divider sx={{ my: 3 }} />
                                        </>
                                    )}

                                    {article.content.steps && article.content.steps.length > 0 && (
                                        <>
                                            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                                                Step-by-Step Instructions
                                            </Typography>
                                            <Stepper orientation="vertical">
                                                {article.content.steps.map((step, index) => (
                                                    <Step key={index} active={true} completed={false}>
                                                        <StepLabel>
                                                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                                {step.title}
                                                            </Typography>
                                                        </StepLabel>
                                                        <StepContent>
                                                            <Typography variant="body1" paragraph>
                                                                {step.description}
                                                            </Typography>
                                                            {step.image && (
                                                                <Box sx={{ my: 2 }}>
                                                                    <img
                                                                        src={step.image}
                                                                        alt={step.title}
                                                                        style={{ maxWidth: '100%', borderRadius: '8px' }}
                                                                    />
                                                                </Box>
                                                            )}
                                                        </StepContent>
                                                    </Step>
                                                ))}
                                            </Stepper>
                                            <Divider sx={{ my: 3 }} />
                                        </>
                                    )}
                                </>
                            )}

                            {/* Troubleshooting Content */}
                            {article.type === 'troubleshooting' && (
                                <>
                                    {article.content.summary && (
                                        <>
                                            <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                                                {article.content.summary}
                                            </Typography>
                                            <Divider sx={{ my: 3 }} />
                                        </>
                                    )}

                                    {article.content.body && (
                                        <>
                                            <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                                                {article.content.body}
                                            </Typography>
                                            <Divider sx={{ my: 3 }} />
                                        </>
                                    )}

                                    {article.content.commonIssues && article.content.commonIssues.length > 0 && (
                                        <>
                                            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                                                Common Issues & Solutions
                                            </Typography>
                                            {article.content.commonIssues.map((item, index) => (
                                                <Card key={index} sx={{ mb: 2, bgcolor: '#FEF2F2' }}>
                                                    <CardContent>
                                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                                                            <ErrorIcon sx={{ color: '#EF4444', mt: 0.5 }} />
                                                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#EF4444' }}>
                                                                Issue: {item.issue}
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, ml: 4 }}>
                                                            <CheckIcon sx={{ color: '#10B981', mt: 0.5 }} />
                                                            <Typography variant="body2">
                                                                <strong>Solution:</strong> {item.solution}
                                                            </Typography>
                                                        </Box>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                            <Divider sx={{ my: 3 }} />
                                        </>
                                    )}
                                </>
                            )}

                            {/* Tips */}
                            {article.content.tips && article.content.tips.length > 0 && (
                                <>
                                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                        💡 Tips
                                    </Typography>
                                    <List>
                                        {article.content.tips.map((tip, index) => (
                                            <ListItem key={index}>
                                                <ListItemIcon>
                                                    <TipIcon sx={{ color: '#F59E0B' }} />
                                                </ListItemIcon>
                                                <ListItemText primary={tip} />
                                            </ListItem>
                                        ))}
                                    </List>
                                    <Divider sx={{ my: 3 }} />
                                </>
                            )}

                            {/* Warnings */}
                            {article.content.warnings && article.content.warnings.length > 0 && (
                                <>
                                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                        ⚠️ Warnings
                                    </Typography>
                                    <List>
                                        {article.content.warnings.map((warning, index) => (
                                            <ListItem key={index}>
                                                <ListItemIcon>
                                                    <WarningIcon sx={{ color: '#EF4444' }} />
                                                </ListItemIcon>
                                                <ListItemText primary={warning} />
                                            </ListItem>
                                        ))}
                                    </List>
                                    <Divider sx={{ my: 3 }} />
                                </>
                            )}

                            {/* Was this helpful? */}
                            <Box sx={{ mt: 4, p: 3, bgcolor: '#F9FAFB', borderRadius: 2 }}>
                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                    Was this article helpful?
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                                    <Button
                                        variant={userVote === 'helpful' ? 'contained' : 'outlined'}
                                        startIcon={userVote === 'helpful' ? <ThumbUpIcon /> : <ThumbUpOutlineIcon />}
                                        onClick={() => handleVote('helpful')}
                                        sx={{
                                            borderColor: '#10B981',
                                            color: userVote === 'helpful' ? 'white' : '#10B981',
                                            bgcolor: userVote === 'helpful' ? '#10B981' : 'transparent',
                                            '&:hover': {
                                                bgcolor: userVote === 'helpful' ? '#059669' : '#E0F2FE'
                                            }
                                        }}
                                    >
                                        Yes ({helpfulCount})
                                    </Button>
                                    <Button
                                        variant={userVote === 'notHelpful' ? 'contained' : 'outlined'}
                                        startIcon={userVote === 'notHelpful' ? <ThumbDownIcon /> : <ThumbDownOutlineIcon />}
                                        onClick={() => handleVote('notHelpful')}
                                        sx={{
                                            borderColor: '#EF4444',
                                            color: userVote === 'notHelpful' ? 'white' : '#EF4444',
                                            bgcolor: userVote === 'notHelpful' ? '#EF4444' : 'transparent',
                                            '&:hover': {
                                                bgcolor: userVote === 'notHelpful' ? '#DC2626' : '#FEE2E2'
                                            }
                                        }}
                                    >
                                        No ({notHelpfulCount})
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        startIcon={<ShareIcon />}
                                        onClick={handleShare}
                                        sx={{ ml: 'auto' }}
                                    >
                                        Share
                                    </Button>
                                </Box>
                            </Box>

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
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                    Related Articles
                                </Typography>
                                {relatedArticles.map((related) => (
                                    <Card
                                        key={related._id}
                                        sx={{ mb: 2, cursor: 'pointer' }}
                                        component={Link}
                                        to={`/resources/help/${related.slug}`}
                                        style={{ textDecoration: 'none' }}
                                    >
                                        <CardContent>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                <Box sx={{ color: TYPE_COLORS[related.type] }}>
                                                    {TYPE_ICONS[related.type]}
                                                </Box>
                                                <Chip
                                                    label={related.type}
                                                    size="small"
                                                    sx={{ bgcolor: TYPE_COLORS[related.type], color: 'white', textTransform: 'capitalize' }}
                                                />
                                            </Box>
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

export default HelpCenterDetail;
