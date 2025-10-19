import { ThemedText } from '@/components/themed-text';
import { theme } from '@/constants/theme';
import { useContactStore } from '@/store/useContactStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import {
  Activity,
  ArrowUpRight,
  HelpCircle,
  LogOut,
  MapPin,
  Package,
  Plus,
  Settings,
  Target,
  TrendingUp,
  User,
  Users,
  X
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

interface AuthUser {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  roles: string[];
}

export default function DashboardScreen() {
  const { loadContacts, contacts } = useContactStore();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-300));

  useEffect(() => {
    loadContacts();
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userJson = await AsyncStorage.getItem('@auth_user');
      if (userJson) {
        const userData = JSON.parse(userJson);
        setUser(userData);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const openDrawer = () => {
    setDrawerVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(slideAnim, {
      toValue: -300,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setDrawerVisible(false);
    });
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(['@auth_token', '@auth_user']);
              closeDrawer();
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getUserDisplayName = () => {
    if (!user) return 'Sales Champion';
    return user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username;
  };

  const quickActions = [
    {
      icon: Plus,
      label: 'New Client',
      route: '/register-client',
      color: theme.colors.primary,
    },
    {
      icon: Package,
      label: 'New Order',
      route: '/orders',
      color: theme.colors.primaryDark,
    },
    {
      icon: Activity,
      label: 'Log Activity',
      route: '/activities',
      color: theme.colors.success,
    },
    {
      icon: MapPin,
      label: 'Route Plan',
      route: null,
      color: theme.colors.warning,
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <ThemedText style={styles.greeting}>{getGreeting()}</ThemedText>
            <ThemedText style={styles.userName}>{getUserDisplayName()}</ThemedText>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={openDrawer}
          >
            <User size={20} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCardContainer}>
          <View style={styles.balanceCard}>
            <View style={styles.balanceCardContent}>
              <View>
                <ThemedText style={styles.balanceLabel}>Your Revenue</ThemedText>
                <ThemedText style={styles.balanceAmount}>
                  KES 156,000
                </ThemedText>
                <ThemedText style={styles.balanceSubtext}>
                  +12.5% from last month
                </ThemedText>
              </View>
              <TouchableOpacity style={styles.switchCardButton}>
                <ThemedText style={styles.switchCardText}>
                  View Details
                </ThemedText>
              </TouchableOpacity>
            </View>
            <View style={styles.cardInfo}>
              <ThemedText style={styles.cardNumber}>
                MTD Sales • Q1 Target: 78%
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickActionButton}
              onPress={() => action.route && router.push(action.route as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
                <action.icon size={24} color={action.color} />
              </View>
              <ThemedText style={styles.quickActionLabel}>
                {action.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <StatsCard
            icon={Target}
            label="Monthly Target"
            value="78%"
            trend="+15%"
            color={theme.colors.success}
          />
          <StatsCard
            icon={Users}
            label="Active Leads"
            value="24"
            trend="+8"
            color={theme.colors.primary}
          />
          <StatsCard
            icon={Package}
            label="Orders"
            value="12"
            trend="+3"
            color={theme.colors.warning}
          />
          <StatsCard
            icon={TrendingUp}
            label="Conversion"
            value="32%"
            trend="+5%"
            color={theme.colors.primaryDark}
          />
        </View>
      </ScrollView>

      {/* Profile Drawer Modal */}
      <Modal
        visible={drawerVisible}
        transparent={true}
        animationType="none"
        onRequestClose={closeDrawer}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1}
          onPress={closeDrawer}
        >
          <Animated.View 
            style={[
              styles.drawerContainer,
              { transform: [{ translateX: slideAnim }] }
            ]}
          >
            <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
              {/* Drawer Header */}
              <View style={styles.drawerHeader}>
                <View style={styles.profileSection}>
                  <View style={styles.avatarContainer}>
                    <User size={32} color="white" />
                  </View>
                  <View style={styles.profileInfo}>
                    <ThemedText style={styles.drawerUserName}>
                      {getUserDisplayName()}
                    </ThemedText>
                    <ThemedText style={styles.drawerUserEmail}>
                      {user?.email || 'user@spectile.com'}
                    </ThemedText>
                    {user?.roles && user.roles.length > 0 && (
                      <View style={styles.roleContainer}>
                        <ThemedText style={styles.roleText}>
                          {user.roles[0].replace('ROLE_', '')}
                        </ThemedText>
                      </View>
                    )}
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={closeDrawer}
                >
                  <X size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>

              {/* Drawer Menu Items */}
              <View style={styles.menuSection}>
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    closeDrawer();
                    // Navigate to profile
                  }}
                >
                  <User size={20} color={theme.colors.text} />
                  <ThemedText style={styles.menuItemText}>My Profile</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    closeDrawer();
                    // Navigate to settings
                  }}
                >
                  <Settings size={20} color={theme.colors.text} />
                  <ThemedText style={styles.menuItemText}>Settings</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    closeDrawer();
                    // Navigate to help
                  }}
                >
                  <HelpCircle size={20} color={theme.colors.text} />
                  <ThemedText style={styles.menuItemText}>Help & Support</ThemedText>
                </TouchableOpacity>

                <View style={styles.divider} />

                <TouchableOpacity 
                  style={[styles.menuItem, styles.logoutItem]}
                  onPress={handleLogout}
                >
                  <LogOut size={20} color={theme.colors.danger} />
                  <ThemedText style={[styles.menuItemText, styles.logoutText]}>
                    Logout
                  </ThemedText>
                </TouchableOpacity>
              </View>

              {/* App Version */}
              {/* <View style={styles.drawerFooter}>
                <ThemedText style={styles.versionText}>
                  Spectile CRM v1.0.0
                </ThemedText>
              </View> */}
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// Stats Card Component
function StatsCard({
  icon: Icon,
  label,
  value,
  trend,
  color,
}: {
  icon: any;
  label: string;
  value: string;
  trend: string;
  color: string;
}) {
  return (
    <View style={styles.statsCard}>
      <View style={styles.statsCardContent}>
        <View style={[styles.statsIconContainer, { backgroundColor: color + '20' }]}>
          <Icon size={20} color={color} />
        </View>
        <ThemedText style={styles.statsValue}>{value}</ThemedText>
        <ThemedText style={styles.statsLabel}>{label}</ThemedText>
        <View style={styles.statsTrendContainer}>
          <ArrowUpRight size={12} color={theme.colors.success} />
          <ThemedText style={styles.statsTrend}>{trend}</ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xl * 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xs,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  balanceCardContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  balanceCard: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  balanceCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  balanceLabel: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.sm,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  balanceSubtext: {
    fontSize: 12,
    color: theme.colors.textLight,
  },
  switchCardButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  switchCardText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.card,
  },
  cardInfo: {
    marginTop: theme.spacing.md,
  },
  cardNumber: {
    fontSize: 12,
    color: theme.colors.textLight,
    fontWeight: '500',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  quickActionButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  quickActionLabel: {
    fontSize: 12,
    color: theme.colors.text,
    fontWeight: '500',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  statsCard: {
    width: (width - theme.spacing.lg * 2 - theme.spacing.sm) / 2,
    margin: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statsCardContent: {
    padding: theme.spacing.sm,
  },
  statsIconContainer: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  statsValue: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  statsLabel: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xs,
  },
  statsTrendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsTrend: {
    fontSize: 12,
    color: theme.colors.success,
    marginLeft: theme.spacing.xs,
    fontWeight: '500',
  },
  // Drawer Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  drawerContainer: {
    width: 300,
    height: '100%',
    backgroundColor: theme.colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  drawerHeader: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl + 20,
    backgroundColor: theme.colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  drawerUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: theme.spacing.xs,
  },
  drawerUserEmail: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: theme.spacing.xs,
  },
  roleContainer: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  closeButton: {
    position: 'absolute',
    top: theme.spacing.md + 20,
    right: theme.spacing.md,
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuSection: {
    paddingVertical: theme.spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: theme.spacing.md,
    color: theme.colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.sm,
    marginHorizontal: theme.spacing.lg,
  },
  logoutItem: {
    marginTop: theme.spacing.sm,
  },
  logoutText: {
    color: theme.colors.danger,
    fontWeight: '500',
  },
  drawerFooter: {
    position: 'absolute',
    bottom: theme.spacing.lg,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    color: theme.colors.textLight,
  },
});