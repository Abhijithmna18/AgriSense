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
    Visibility as ViewIcon,
    Publish as PublishIcon,
    Star as StarIcon,
    StarBorder as StarBorderIcon
} from '@mui/icons-material';
import {
    getAllCropKnowledge,
    createCropKnowledge,
    updateCropKnowledge,
    deleteCropKnowledge,
    togglePublishCropKnowledge,
    toggleFeatureCropKnowledge
} from '../../../services/cropKnowledgeService';

const CATEGORIES = ['Cereals', 'Pulses', 'Vegetables', 'Fruits', 'Spices', 'Cash Crops', 'Oilseeds', 'Fiber Crops'];

const CropKnowledgeAdmin = () => {
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
        category: 'Cereals',
        tags: '',
        status: 'draft',
        coverImage: '',
        content: {
            introduction: '',
            cultivation: {
                soilRequirements: '',
                climate: '',
                season: '',
                waterRequirements: ''
            },
            practices: {
                landPreparation: '',
                sowing: {
                    method: '',
                    spacing: '',
                    seedRate: ''
                },
                fertilization: {
                    npkRatio: '',
                    basal: '',
                    topDressing: ''
                }
            },
            harvest: {
                duration: '',
                harvestingMethod: '',
                expectedYield: {
                    min: '',
                    max: '',
                    unit: 'kg/ha'
                }
            }
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
            const response = await getAllCropKnowledge(params);
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
                category: article.category || 'Cereals',
                tags: article.tags?.join(', ') || '',
                status: article.status || 'draft',
                coverImage: article.coverImage || '',
                content: {
                    introduction: article.content?.introduction || '',
                    cultivation: {
                        soilRequirements: article.content?.cultivation?.soilRequirements || '',
                        climate: article.content?.cultivation?.climate || '',
                        season: article.content?.cultivation?.season || '',
                        waterRequirements: article.content?.cultivation?.waterRequirements || ''
                    },
                    practices: {
                        landPreparation: article.content?.practices?.landPreparation || '',
                        sowing: {
                            method: article.content?.practices?.sowing?.method || '',
                            spacing: article.content?.practices?.sowing?.spacing || '',
                            seedRate: article.content?.practices?.sowing?.seedRate || ''
                        },
                        fertilization: {
                            npkRatio: article.content?.practices?.fertilization?.npkRatio || '',
                            basal: article.content?.practices?.fertilization?.basal || '',
                            topDressing: article.content?.practices?.fertilization?.topDressing || ''
                        }
                    },
                    harvest: {
                        duration: article.content?.harvest?.duration || '',
                        harvestingMethod: article.content?.harvest?.harvestingMethod || '',
                        expectedYield: {
                            min: article.content?.harvest?.expectedYield?.min || '',
                            max: article.content?.harvest?.expectedYield?.max || '',
                            unit: article.content?.harvest?.expectedYield?.unit || 'kg/ha'
                        }
                    }
                }
            });
        } else {
            setEditingArticle(null);
            setFormData({
                title: '',
                slug: '',
                category: 'Cereals',
                tags: '',
                status: 'draft',
                coverImage: '',
                content: {
                    introduction: '',
                    cultivation: {
                        soilRequirements: '',
                        climate: '',
                        season: '',
                        waterRequirements: ''
                    },
                    practices: {
                        landPreparation: '',
                        sowing: { method: '', spacing: '', seedRate: '' },
                        fertilization: { npkRatio: '', basal: '', topDressing: '' }
                    },
                    harvest: {
                        duration: '',
                        harvestingMethod: '',
                        expectedYield: { min: '', max: '', unit: 'kg/ha' }
                    }
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

    const handleNestedInputChange = (path, value) => {
        setFormData(prev => {
            const newData = { ...prev };
            const keys = path.split('.');
            let current = newData;
            
            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) current[keys[i]] = {};
                current = current[keys[i]];
            }
            
            current[keys[keys.length - 1]] = value;
            return newData;
        });
    };

    const handleSubmit = async () => {
        setError(null);
        setSuccess(null);

        try {
            // Generate slug from title if not provided
            const slug = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            
            // Convert tags string to array
            const tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);

            const articleData = {
                ...formData,
                slug,
                tags
            };

            if (editingArticle) {
                await updateCropKnowledge(editingArticle._id, articleData);
                setSuccess('Article updated successfully');
            } else {
                await createCropKnowledge(articleData);
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
            await deleteCropKnowledge(id);
            setSuccess('Article deleted successfully');
            fetchArticles();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete article');
        }
    };

    const handleTogglePublish = async (id) => {
        try {
            await togglePublishCropKnowledge(id);
            setSuccess('Article status updated');
            fetchArticles();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update status');
        }
    };

    const handleToggleFeatured = async (id) => {
        try {
            await toggleFeatureCropKnowledge(id);
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
                    Crop Knowledge Management
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

            {/* Status Tabs */}
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
                                <TableCell>Category</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Views</TableCell>
                                <TableCell>Likes</TableCell>
                                <TableCell>Featured</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {articles.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
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
                                            <Chip label={article.category} size="small" />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={article.status}
                                                size="small"
                                                color={article.status === 'published' ? 'success' : 'default'}
                                            />
                                        </TableCell>
                                        <TableCell>{article.views || 0}</TableCell>
                                        <TableCell>{article.likes || 0}</TableCell>
                                        <TableCell>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleToggleFeatured(article._id)}
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
                                helperText="Leave empty to auto-generate from title"
                            />
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
                                label="Tags (comma separated)"
                                value={formData.tags}
                                onChange={(e) => handleInputChange('tags', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Cover Image URL"
                                value={formData.coverImage}
                                onChange={(e) => handleInputChange('coverImage', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                label="Introduction"
                                value={formData.content.introduction}
                                onChange={(e) => handleNestedInputChange('content.introduction', e.target.value)}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" gutterBottom>Cultivation</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                multiline
                                rows={2}
                                label="Soil Requirements"
                                value={formData.content.cultivation.soilRequirements}
                                onChange={(e) => handleNestedInputChange('content.cultivation.soilRequirements', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                multiline
                                rows={2}
                                label="Climate"
                                value={formData.content.cultivation.climate}
                                onChange={(e) => handleNestedInputChange('content.cultivation.climate', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Season"
                                value={formData.content.cultivation.season}
                                onChange={(e) => handleNestedInputChange('content.cultivation.season', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Water Requirements"
                                value={formData.content.cultivation.waterRequirements}
                                onChange={(e) => handleNestedInputChange('content.cultivation.waterRequirements', e.target.value)}
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

export default CropKnowledgeAdmin;
