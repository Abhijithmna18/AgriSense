import React, { useState, useEffect } from 'react';
import {
    Container,
    Box,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Grid,
    Alert,
    CircularProgress,
    Tabs,
    Tab
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Publish as PublishIcon,
    Star as StarIcon,
    StarBorder as StarBorderIcon
} from '@mui/icons-material';
import {
    getAllHelpArticles,
    createHelpArticle,
    updateHelpArticle,
    deleteHelpArticle,
    togglePublishHelpArticle,
    toggleFeatureHelpArticle
} from '../../../services/helpCenterService';

const TYPES = ['faq', 'guide', 'tutorial', 'troubleshooting', 'documentation'];
const CATEGORIES = [
    'Getting Started',
    'Account Management',
    'Marketplace',
    'Finance & Payments',
    'Farm Management',
    'Weather & Alerts',
    'Disease Detection',
    'Technical Support',
    'Mobile App',
    'General'
];
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];

const HelpCenterAdmin = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingArticle, setEditingArticle] = useState(null);
    const [currentTab, setCurrentTab] = useState('all');
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        type: 'faq',
        category: 'Getting Started',
        tags: '',
        status: 'draft',
        difficulty: 'beginner',
        estimatedTime: '',
        priority: 0,
        content: {
            question: '',
            answer: '',
            summary: '',
            body: '',
            prerequisites: '',
            tips: '',
            warnings: ''
        }
    });

    useEffect(() => {
        fetchArticles();
    }, [currentTab]);

    const fetchArticles = async () => {
        setLoading(true);
        setError(null);

        try {
            const params = { limit: 100 };
            if (currentTab !== 'all') {
                params.status = currentTab;
            }
            const response = await getAllHelpArticles(params);
            setArticles(response.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch articles');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (article = null) => {
        if (article) {
            setEditingArticle(article);
            setFormData({
                title: article.title || '',
                slug: article.slug || '',
                type: article.type || 'faq',
                category: article.category || 'Getting Started',
                tags: article.tags?.join(', ') || '',
                status: article.status || 'draft',
                difficulty: article.difficulty || 'beginner',
                estimatedTime: article.estimatedTime || '',
                priority: article.priority || 0,
                content: {
                    question: article.content?.question || '',
                    answer: article.content?.answer || '',
                    summary: article.content?.summary || '',
                    body: article.content?.body || '',
                    prerequisites: article.content?.prerequisites?.join('\n') || '',
                    tips: article.content?.tips?.join('\n') || '',
                    warnings: article.content?.warnings?.join('\n') || ''
                }
            });
        } else {
            setEditingArticle(null);
            setFormData({
                title: '',
                slug: '',
                type: 'faq',
                category: 'Getting Started',
                tags: '',
                status: 'draft',
                difficulty: 'beginner',
                estimatedTime: '',
                priority: 0,
                content: {
                    question: '',
                    answer: '',
                    summary: '',
                    body: '',
                    prerequisites: '',
                    tips: '',
                    warnings: ''
                }
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingArticle(null);
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleContentChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            content: { ...prev.content, [field]: value }
        }));
    };

    const handleSubmit = async () => {
        setError(null);
        setSuccess(null);

        try {
            const slug = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);

            const articleData = {
                ...formData,
                slug,
                tags,
                content: {
                    ...formData.content,
                    prerequisites: formData.content.prerequisites.split('\n').filter(p => p.trim()),
                    tips: formData.content.tips.split('\n').filter(t => t.trim()),
                    warnings: formData.content.warnings.split('\n').filter(w => w.trim())
                }
            };

            if (editingArticle) {
                await updateHelpArticle(editingArticle._id, articleData);
                setSuccess('Article updated successfully');
            } else {
                await createHelpArticle(articleData);
                setSuccess('Article created successfully');
            }

            handleCloseDialog();
            fetchArticles();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save article');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this article?')) return;

        try {
            await deleteHelpArticle(id);
            setSuccess('Article deleted successfully');
            fetchArticles();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete article');
        }
    };

    const handleTogglePublish = async (id) => {
        try {
            await togglePublishHelpArticle(id);
            setSuccess('Article status updated');
            fetchArticles();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update status');
        }
    };

    const handleToggleFeatured = async (id, currentPriority) => {
        try {
            await toggleFeatureHelpArticle(id, currentPriority);
            setSuccess('Featured status updated');
            fetchArticles();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update featured status');
        }
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    Help Center Management
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                    sx={{ bgcolor: '#10B981', '&:hover': { bgcolor: '#059669' } }}
                >
                    Add New Article
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={currentTab} onChange={(e, val) => setCurrentTab(val)}>
                    <Tab label="All" value="all" />
                    <Tab label="Published" value="published" />
                    <Tab label="Draft" value="draft" />
                    <Tab label="Archived" value="archived" />
                </Tabs>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress sx={{ color: '#10B981' }} />
                </Box>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Title</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Views</TableCell>
                                <TableCell>Helpful</TableCell>
                                <TableCell>Featured</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {articles.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">
                                        No articles found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                articles.map((article) => (
                                    <TableRow key={article._id}>
                                        <TableCell>
                                            <Typography variant="subtitle2">{article.title}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {article.slug}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={article.type} size="small" sx={{ textTransform: 'capitalize' }} />
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={article.category} size="small" variant="outlined" />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={article.status}
                                                size="small"
                                                color={article.status === 'published' ? 'success' : 'default'}
                                            />
                                        </TableCell>
                                        <TableCell>{article.views || 0}</TableCell>
                                        <TableCell>
                                            {article.helpful || 0} / {(article.helpful || 0) + (article.notHelpful || 0)}
                                        </TableCell>
                                        <TableCell>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleToggleFeatured(article._id, article.priority)}
                                                color={article.isFeatured ? 'warning' : 'default'}
                                            >
                                                {article.isFeatured ? <StarIcon /> : <StarBorderIcon />}
                                            </IconButton>
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleTogglePublish(article._id)}
                                                color="primary"
                                            >
                                                <PublishIcon />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleOpenDialog(article)}
                                                color="info"
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDelete(article._id)}
                                                color="error"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    {editingArticle ? 'Edit Article' : 'Create New Article'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Title"
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Slug"
                                value={formData.slug}
                                onChange={(e) => handleInputChange('slug', e.target.value)}
                                helperText="Leave empty to auto-generate"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                label="Type"
                                value={formData.type}
                                onChange={(e) => handleInputChange('type', e.target.value)}
                            >
                                {TYPES.map((type) => (
                                    <MenuItem key={type} value={type} sx={{ textTransform: 'capitalize' }}>
                                        {type}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                label="Category"
                                value={formData.category}
                                onChange={(e) => handleInputChange('category', e.target.value)}
                            >
                                {CATEGORIES.map((cat) => (
                                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                label="Status"
                                value={formData.status}
                                onChange={(e) => handleInputChange('status', e.target.value)}
                            >
                                <MenuItem value="draft">Draft</MenuItem>
                                <MenuItem value="published">Published</MenuItem>
                                <MenuItem value="archived">Archived</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                label="Difficulty"
                                value={formData.difficulty}
                                onChange={(e) => handleInputChange('difficulty', e.target.value)}
                            >
                                {DIFFICULTIES.map((diff) => (
                                    <MenuItem key={diff} value={diff} sx={{ textTransform: 'capitalize' }}>
                                        {diff}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Estimated Time"
                                value={formData.estimatedTime}
                                onChange={(e) => handleInputChange('estimatedTime', e.target.value)}
                                placeholder="e.g., 10 minutes"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Tags (comma separated)"
                                value={formData.tags}
                                onChange={(e) => handleInputChange('tags', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Priority (0-100)"
                                value={formData.priority}
                                onChange={(e) => handleInputChange('priority', parseInt(e.target.value))}
                                inputProps={{ min: 0, max: 100 }}
                            />
                        </Grid>

                        {/* FAQ Fields */}
                        {formData.type === 'faq' && (
                            <>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Question"
                                        value={formData.content.question}
                                        onChange={(e) => handleContentChange('question', e.target.value)}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={6}
                                        label="Answer"
                                        value={formData.content.answer}
                                        onChange={(e) => handleContentChange('answer', e.target.value)}
                                        required
                                    />
                                </Grid>
                            </>
                        )}

                        {/* Guide/Tutorial/Documentation Fields */}
                        {(formData.type === 'guide' || formData.type === 'tutorial' || formData.type === 'documentation') && (
                            <>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={3}
                                        label="Summary"
                                        value={formData.content.summary}
                                        onChange={(e) => handleContentChange('summary', e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={8}
                                        label="Body"
                                        value={formData.content.body}
                                        onChange={(e) => handleContentChange('body', e.target.value)}
                                    />
                                </Grid>
                            </>
                        )}

                        {/* Troubleshooting Fields */}
                        {formData.type === 'troubleshooting' && (
                            <>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={3}
                                        label="Summary"
                                        value={formData.content.summary}
                                        onChange={(e) => handleContentChange('summary', e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={6}
                                        label="Body"
                                        value={formData.content.body}
                                        onChange={(e) => handleContentChange('body', e.target.value)}
                                    />
                                </Grid>
                            </>
                        )}

                        {/* Common Fields */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Prerequisites (one per line)"
                                value={formData.content.prerequisites}
                                onChange={(e) => handleContentChange('prerequisites', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Tips (one per line)"
                                value={formData.content.tips}
                                onChange={(e) => handleContentChange('tips', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Warnings (one per line)"
                                value={formData.content.warnings}
                                onChange={(e) => handleContentChange('warnings', e.target.value)}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        sx={{ bgcolor: '#10B981', '&:hover': { bgcolor: '#059669' } }}
                    >
                        {editingArticle ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default HelpCenterAdmin;
