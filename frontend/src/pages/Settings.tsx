import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  BuildingOfficeIcon,
  ArrowsRightLeftIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  ArrowUpCircleIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  QuestionMarkCircleIcon,
  ChevronRightIcon,
  CalculatorIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface SettingItem {
  id: string;
  name: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  adminOnly?: boolean;
  divider?: boolean;
}

// Modal Content Components
const OrganizationProfileContent = () => {
  const { organizationName, user } = useAuth();
  const [formData, setFormData] = useState({
    name: organizationName || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    country: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Organization profile updated successfully!');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-blue-100 mb-2">Organization Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 bg-blue-600/30 border-2 border-blue-400/50 rounded-xl text-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400/60"
            placeholder="Enter organization name"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-blue-100 mb-2">Email *</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 bg-blue-600/30 border-2 border-blue-400/50 rounded-xl text-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400/60"
            placeholder="Enter email"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-blue-100 mb-2">Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-3 bg-blue-600/30 border-2 border-blue-400/50 rounded-xl text-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400/60"
            placeholder="Enter phone number"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-blue-100 mb-2">City</label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full px-4 py-3 bg-blue-600/30 border-2 border-blue-400/50 rounded-xl text-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400/60"
            placeholder="Enter city"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-blue-100 mb-2">Address</label>
          <textarea
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 bg-blue-600/30 border-2 border-blue-400/50 rounded-xl text-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400/60"
            placeholder="Enter full address"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-blue-100 mb-2">Country</label>
          <input
            type="text"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            className="w-full px-4 py-3 bg-blue-600/30 border-2 border-blue-400/50 rounded-xl text-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400/60"
            placeholder="Enter country"
          />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          className="px-6 py-2.5 bg-blue-600/30 text-blue-200 rounded-xl font-bold hover:bg-blue-600/50 transition-colors border border-blue-400/40"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2.5 gradient-accent text-blue-50 rounded-xl font-bold hover:shadow-xl transition-all glow-effect border border-blue-400/30"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
};

const SwitchOrganizationContent = () => {
  const [organizations] = useState([
    { id: '1', name: 'Current Organization', active: true },
    { id: '2', name: 'Organization 2', active: false },
    { id: '3', name: 'Organization 3', active: false },
  ]);

  const handleSwitch = (orgId: string) => {
    toast.success('Organization switched successfully!');
  };

  return (
    <div className="space-y-4">
      <p className="text-blue-200/80 text-sm mb-4">Select an organization to switch to:</p>
      <div className="space-y-2">
        {organizations.map((org) => (
          <button
            key={org.id}
            onClick={() => handleSwitch(org.id)}
            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
              org.active
                ? 'bg-blue-500/30 border-blue-400/50'
                : 'bg-blue-600/20 border-blue-400/30 hover:bg-blue-600/30 hover:border-blue-400/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-50">{org.name}</span>
              {org.active && (
                <span className="px-3 py-1 bg-blue-500/40 text-blue-50 rounded-lg text-xs font-bold">
                  Current
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

const UsersContent = () => {
  return (
    <div className="space-y-4">
      <p className="text-blue-200/80 text-sm mb-4">
        User management is available in the Staff Management section. Navigate there to add, edit, or remove users.
      </p>
      <button
        onClick={() => {
          window.location.href = '/staff';
        }}
        className="px-6 py-2.5 gradient-accent text-blue-50 rounded-xl font-bold hover:shadow-xl transition-all glow-effect border border-blue-400/30"
      >
        Go to Staff Management
      </button>
    </div>
  );
};

const CurrenciesContent = () => {
  const [currencies, setCurrencies] = useState([
    { code: 'USD', name: 'US Dollar', symbol: '$', active: true },
    { code: 'EUR', name: 'Euro', symbol: '€', active: true },
    { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', active: false },
  ]);

  const [newCurrency, setNewCurrency] = useState({ code: '', name: '', symbol: '' });

  const handleAdd = () => {
    if (newCurrency.code && newCurrency.name && newCurrency.symbol) {
      setCurrencies([...currencies, { ...newCurrency, active: true }]);
      setNewCurrency({ code: '', name: '', symbol: '' });
      toast.success('Currency added successfully!');
    }
  };

  const toggleActive = (code: string) => {
    setCurrencies(
      currencies.map((c) => (c.code === code ? { ...c, active: !c.active } : c))
    );
    toast.success('Currency status updated!');
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <input
          type="text"
          placeholder="Code (e.g., USD)"
          value={newCurrency.code}
          onChange={(e) => setNewCurrency({ ...newCurrency, code: e.target.value.toUpperCase() })}
          className="px-4 py-2 bg-blue-600/30 border-2 border-blue-400/50 rounded-xl text-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400/60"
        />
        <input
          type="text"
          placeholder="Name"
          value={newCurrency.name}
          onChange={(e) => setNewCurrency({ ...newCurrency, name: e.target.value })}
          className="px-4 py-2 bg-blue-600/30 border-2 border-blue-400/50 rounded-xl text-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400/60"
        />
        <input
          type="text"
          placeholder="Symbol"
          value={newCurrency.symbol}
          onChange={(e) => setNewCurrency({ ...newCurrency, symbol: e.target.value })}
          className="px-4 py-2 bg-blue-600/30 border-2 border-blue-400/50 rounded-xl text-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400/60"
        />
      </div>
      <button
        onClick={handleAdd}
        className="px-6 py-2.5 gradient-accent text-blue-50 rounded-xl font-bold hover:shadow-xl transition-all glow-effect border border-blue-400/30"
      >
        Add Currency
      </button>
      <div className="space-y-2 mt-4">
        {currencies.map((currency) => (
          <div
            key={currency.code}
            className="flex items-center justify-between p-4 bg-blue-600/20 rounded-xl border border-blue-400/30"
          >
            <div>
              <span className="font-bold text-blue-50">{currency.code}</span>
              <span className="text-blue-200/80 ml-2">- {currency.name} ({currency.symbol})</span>
            </div>
            <button
              onClick={() => toggleActive(currency.code)}
              className={`px-4 py-2 rounded-lg text-xs font-bold ${
                currency.active
                  ? 'bg-emerald-500/40 text-emerald-50 border border-emerald-400/40'
                  : 'bg-gray-500/40 text-gray-200 border border-gray-400/40'
              }`}
            >
              {currency.active ? 'Active' : 'Inactive'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const TaxesContent = () => {
  const [taxes, setTaxes] = useState([
    { id: '1', name: 'Sales Tax', rate: 18, active: true },
    { id: '2', name: 'VAT', rate: 15, active: true },
  ]);

  const [newTax, setNewTax] = useState({ name: '', rate: 0 });

  const handleAdd = () => {
    if (newTax.name && newTax.rate > 0) {
      setTaxes([...taxes, { id: Date.now().toString(), ...newTax, active: true }]);
      setNewTax({ name: '', rate: 0 });
      toast.success('Tax added successfully!');
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="Tax Name"
          value={newTax.name}
          onChange={(e) => setNewTax({ ...newTax, name: e.target.value })}
          className="px-4 py-2 bg-blue-600/30 border-2 border-blue-400/50 rounded-xl text-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400/60"
        />
        <input
          type="number"
          placeholder="Rate (%)"
          value={newTax.rate}
          onChange={(e) => setNewTax({ ...newTax, rate: parseFloat(e.target.value) || 0 })}
          className="px-4 py-2 bg-blue-600/30 border-2 border-blue-400/50 rounded-xl text-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400/60"
        />
      </div>
      <button
        onClick={handleAdd}
        className="px-6 py-2.5 gradient-accent text-blue-50 rounded-xl font-bold hover:shadow-xl transition-all glow-effect border border-blue-400/30"
      >
        Add Tax
      </button>
      <div className="space-y-2 mt-4">
        {taxes.map((tax) => (
          <div
            key={tax.id}
            className="flex items-center justify-between p-4 bg-blue-600/20 rounded-xl border border-blue-400/30"
          >
            <div>
              <span className="font-bold text-blue-50">{tax.name}</span>
              <span className="text-blue-200/80 ml-2">- {tax.rate}%</span>
            </div>
            <span className={`px-4 py-2 rounded-lg text-xs font-bold ${
              tax.active
                ? 'bg-emerald-500/40 text-emerald-50 border border-emerald-400/40'
                : 'bg-gray-500/40 text-gray-200 border border-gray-400/40'
            }`}>
              {tax.active ? 'Active' : 'Inactive'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const PDFTemplateContent = () => {
  const [template, setTemplate] = useState('default');
  const [customizations, setCustomizations] = useState({
    logo: true,
    header: true,
    footer: true,
    watermark: false,
  });

  const handleSave = () => {
    toast.success('PDF template settings saved!');
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-bold text-blue-100 mb-2">Template Style</label>
        <select
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          className="w-full px-4 py-3 bg-blue-600/30 border-2 border-blue-400/50 rounded-xl text-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400/60"
        >
          <option value="default" className="bg-blue-900">Default</option>
          <option value="modern" className="bg-blue-900">Modern</option>
          <option value="classic" className="bg-blue-900">Classic</option>
        </select>
      </div>
      <div className="space-y-3">
        <label className="block text-sm font-bold text-blue-100 mb-2">Customization Options</label>
        {Object.entries(customizations).map(([key, value]) => (
          <label key={key} className="flex items-center justify-between p-3 bg-blue-600/20 rounded-xl border border-blue-400/30 cursor-pointer hover:bg-blue-600/30 transition-colors">
            <span className="text-blue-50 font-medium capitalize">{key}</span>
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => setCustomizations({ ...customizations, [key]: e.target.checked })}
              className="w-5 h-5 rounded border-blue-400/50 bg-blue-600/30 text-blue-500 focus:ring-2 focus:ring-blue-400/60"
            />
          </label>
        ))}
      </div>
      <button
        onClick={handleSave}
        className="w-full px-6 py-2.5 gradient-accent text-blue-50 rounded-xl font-bold hover:shadow-xl transition-all glow-effect border border-blue-400/30"
      >
        Save Template Settings
      </button>
    </div>
  );
};

const PaymentGatewaysContent = () => {
  const [gateways, setGateways] = useState([
    { id: 'stripe', name: 'Stripe', enabled: false },
    { id: 'paypal', name: 'PayPal', enabled: false },
    { id: 'razorpay', name: 'Razorpay', enabled: false },
  ]);

  const toggleGateway = (id: string) => {
    setGateways(gateways.map((g) => (g.id === id ? { ...g, enabled: !g.enabled } : g)));
    toast.success('Payment gateway status updated!');
  };

  return (
    <div className="space-y-4">
      <p className="text-blue-200/80 text-sm mb-4">
        Configure payment gateways for online transactions. Enable the gateways you want to use.
      </p>
      <div className="space-y-3">
        {gateways.map((gateway) => (
          <div
            key={gateway.id}
            className="flex items-center justify-between p-4 bg-blue-600/20 rounded-xl border border-blue-400/30"
          >
            <span className="font-bold text-blue-50">{gateway.name}</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={gateway.enabled}
                onChange={() => toggleGateway(gateway.id)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-blue-600/40 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-400/60 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500/60"></div>
            </label>
          </div>
        ))}
      </div>
      <div className="p-4 bg-blue-600/20 rounded-xl border border-blue-400/30">
        <p className="text-sm text-blue-200/80">
          <strong className="text-blue-50">Note:</strong> After enabling a gateway, you'll need to configure API keys in the gateway settings.
        </p>
      </div>
    </div>
  );
};

const PrivacySecurityContent = () => {
  const [settings, setSettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginNotifications: true,
    dataEncryption: true,
  });

  const handleSave = () => {
    toast.success('Privacy & Security settings saved!');
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <label className="flex items-center justify-between p-4 bg-blue-600/20 rounded-xl border border-blue-400/30 cursor-pointer hover:bg-blue-600/30 transition-colors">
          <div>
            <span className="text-blue-50 font-bold block">Two-Factor Authentication</span>
            <span className="text-blue-200/70 text-xs">Add an extra layer of security</span>
          </div>
          <input
            type="checkbox"
            checked={settings.twoFactorAuth}
            onChange={(e) => setSettings({ ...settings, twoFactorAuth: e.target.checked })}
            className="w-5 h-5 rounded border-blue-400/50 bg-blue-600/30 text-blue-500 focus:ring-2 focus:ring-blue-400/60"
          />
        </label>
        <label className="flex items-center justify-between p-4 bg-blue-600/20 rounded-xl border border-blue-400/30 cursor-pointer hover:bg-blue-600/30 transition-colors">
          <div>
            <span className="text-blue-50 font-bold block">Login Notifications</span>
            <span className="text-blue-200/70 text-xs">Get notified of new login attempts</span>
          </div>
          <input
            type="checkbox"
            checked={settings.loginNotifications}
            onChange={(e) => setSettings({ ...settings, loginNotifications: e.target.checked })}
            className="w-5 h-5 rounded border-blue-400/50 bg-blue-600/30 text-blue-500 focus:ring-2 focus:ring-blue-400/60"
          />
        </label>
        <label className="flex items-center justify-between p-4 bg-blue-600/20 rounded-xl border border-blue-400/30 cursor-pointer hover:bg-blue-600/30 transition-colors">
          <div>
            <span className="text-blue-50 font-bold block">Data Encryption</span>
            <span className="text-blue-200/70 text-xs">Encrypt sensitive data at rest</span>
          </div>
          <input
            type="checkbox"
            checked={settings.dataEncryption}
            onChange={(e) => setSettings({ ...settings, dataEncryption: e.target.checked })}
            className="w-5 h-5 rounded border-blue-400/50 bg-blue-600/30 text-blue-500 focus:ring-2 focus:ring-blue-400/60"
          />
        </label>
        <div className="p-4 bg-blue-600/20 rounded-xl border border-blue-400/30">
          <label className="block text-sm font-bold text-blue-100 mb-2">Session Timeout (minutes)</label>
          <input
            type="number"
            value={settings.sessionTimeout}
            onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) || 30 })}
            className="w-full px-4 py-2 bg-blue-600/30 border-2 border-blue-400/50 rounded-xl text-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400/60"
          />
        </div>
        <div className="p-4 bg-blue-600/20 rounded-xl border border-blue-400/30">
          <label className="block text-sm font-bold text-blue-100 mb-2">Password Expiry (days)</label>
          <input
            type="number"
            value={settings.passwordExpiry}
            onChange={(e) => setSettings({ ...settings, passwordExpiry: parseInt(e.target.value) || 90 })}
            className="w-full px-4 py-2 bg-blue-600/30 border-2 border-blue-400/50 rounded-xl text-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400/60"
          />
        </div>
      </div>
      <button
        onClick={handleSave}
        className="w-full px-6 py-2.5 gradient-accent text-blue-50 rounded-xl font-bold hover:shadow-xl transition-all glow-effect border border-blue-400/30"
      >
        Save Settings
      </button>
    </div>
  );
};

const SubscriptionContent = () => {
  const [plan] = useState({
    name: 'Professional',
    price: 49.99,
    period: 'monthly',
    features: ['Unlimited Products', 'Unlimited Users', 'Advanced Reports', 'Priority Support'],
  });

  return (
    <div className="space-y-4">
      <div className="p-6 bg-gradient-to-br from-blue-500/30 to-blue-600/20 rounded-xl border border-blue-400/40">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-blue-50">{plan.name} Plan</h3>
            <p className="text-blue-200/80 text-sm">Current subscription</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-50">${plan.price}</div>
            <div className="text-blue-200/80 text-sm">/{plan.period}</div>
          </div>
        </div>
        <div className="space-y-2">
          {plan.features.map((feature, idx) => (
            <div key={idx} className="flex items-center text-blue-100">
              <span className="mr-2">✓</span>
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-3">
        <button className="flex-1 px-6 py-2.5 gradient-accent text-blue-50 rounded-xl font-bold hover:shadow-xl transition-all glow-effect border border-blue-400/30">
          Upgrade Plan
        </button>
        <button className="flex-1 px-6 py-2.5 bg-blue-600/30 text-blue-200 rounded-xl font-bold hover:bg-blue-600/50 transition-colors border border-blue-400/40">
          Cancel Subscription
        </button>
      </div>
    </div>
  );
};

const FeedbackContent = () => {
  const [feedback, setFeedback] = useState({
    type: 'suggestion',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Thank you for your feedback! We appreciate your input.');
    setFeedback({ type: 'suggestion', subject: '', message: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-bold text-blue-100 mb-2">Feedback Type</label>
        <select
          value={feedback.type}
          onChange={(e) => setFeedback({ ...feedback, type: e.target.value })}
          className="w-full px-4 py-3 bg-blue-600/30 border-2 border-blue-400/50 rounded-xl text-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400/60"
        >
          <option value="suggestion" className="bg-blue-900">Suggestion</option>
          <option value="bug" className="bg-blue-900">Bug Report</option>
          <option value="feature" className="bg-blue-900">Feature Request</option>
          <option value="other" className="bg-blue-900">Other</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-bold text-blue-100 mb-2">Subject</label>
        <input
          type="text"
          required
          value={feedback.subject}
          onChange={(e) => setFeedback({ ...feedback, subject: e.target.value })}
          className="w-full px-4 py-3 bg-blue-600/30 border-2 border-blue-400/50 rounded-xl text-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400/60"
          placeholder="Enter subject"
        />
      </div>
      <div>
        <label className="block text-sm font-bold text-blue-100 mb-2">Message</label>
        <textarea
          required
          rows={5}
          value={feedback.message}
          onChange={(e) => setFeedback({ ...feedback, message: e.target.value })}
          className="w-full px-4 py-3 bg-blue-600/30 border-2 border-blue-400/50 rounded-xl text-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400/60"
          placeholder="Enter your feedback..."
        />
      </div>
      <button
        type="submit"
        className="w-full px-6 py-2.5 gradient-accent text-blue-50 rounded-xl font-bold hover:shadow-xl transition-all glow-effect border border-blue-400/30"
      >
        Submit Feedback
      </button>
    </form>
  );
};

const RateAppContent = () => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    toast.success('Thank you for rating our app!');
    setRating(0);
    setComment('');
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-bold text-blue-100 mb-3">Rate Your Experience</label>
        <div className="flex gap-2 justify-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="text-4xl transition-transform hover:scale-110"
            >
              {star <= rating ? '⭐' : '☆'}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-bold text-blue-100 mb-2">Comments (Optional)</label>
        <textarea
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full px-4 py-3 bg-blue-600/30 border-2 border-blue-400/50 rounded-xl text-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400/60"
          placeholder="Share your thoughts..."
        />
      </div>
      <button
        onClick={handleSubmit}
        className="w-full px-6 py-2.5 gradient-accent text-blue-50 rounded-xl font-bold hover:shadow-xl transition-all glow-effect border border-blue-400/30"
      >
        Submit Rating
      </button>
    </div>
  );
};

const AboutContent = () => {
  return (
    <div className="space-y-4">
      <div className="p-6 bg-gradient-to-br from-blue-500/30 to-blue-600/20 rounded-xl border border-blue-400/40">
        <h3 className="text-2xl font-bold text-blue-50 mb-2">Inventory Management System</h3>
        <p className="text-blue-200/80 text-sm mb-4">Version 1.0.0</p>
        <p className="text-blue-100 text-sm">
          A comprehensive inventory management solution designed to help you manage your products, stock, categories, and business operations efficiently.
        </p>
      </div>
      <div className="space-y-3">
        <div className="p-4 bg-blue-600/20 rounded-xl border border-blue-400/30">
          <h4 className="font-bold text-blue-50 mb-2">Features</h4>
          <ul className="text-sm text-blue-200/80 space-y-1">
            <li>• Product & Category Management</li>
            <li>• Stock Tracking</li>
            <li>• Low Stock Alerts</li>
            <li>• Staff Management</li>
            <li>• Advanced Reporting</li>
          </ul>
        </div>
        <div className="p-4 bg-blue-600/20 rounded-xl border border-blue-400/30">
          <h4 className="font-bold text-blue-50 mb-2">Technology Stack</h4>
          <ul className="text-sm text-blue-200/80 space-y-1">
            <li>• Frontend: React + Vite + Tailwind CSS</li>
            <li>• Backend: NestJS + Prisma</li>
            <li>• Database: PostgreSQL</li>
            <li>• Authentication: JWT</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export const Settings = () => {
  const { isAdmin, user, organizationName } = useAuth();
  const [selectedSetting, setSelectedSetting] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState<{
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    content: React.ReactNode;
  } | null>(null);

  const handleSettingClick = (settingId: string, name: string) => {
    setSelectedSetting(settingId);
    setShowModal(true);
    
    // Get the icon for this setting
    const setting = settings.find(s => s.id === settingId);
    const Icon = setting?.icon || QuestionMarkCircleIcon;
    
    // Set modal content based on setting
    setModalContent({
      title: name,
      icon: Icon,
      content: renderModalContent(settingId, name),
    });
  };

  const closeModal = () => {
    setShowModal(false);
    setModalContent(null);
    setSelectedSetting(null);
  };

  const renderModalContent = (settingId: string, name: string): React.ReactNode => {
    switch (settingId) {
      case 'org-profile':
        return <OrganizationProfileContent />;
      case 'switch-org':
        return <SwitchOrganizationContent />;
      case 'users':
        return <UsersContent />;
      case 'currencies':
        return <CurrenciesContent />;
      case 'taxes':
        return <TaxesContent />;
      case 'pdf-template':
        return <PDFTemplateContent />;
      case 'payment-gateways':
        return <PaymentGatewaysContent />;
      case 'privacy-security':
        return <PrivacySecurityContent />;
      case 'subscription':
        return <SubscriptionContent />;
      case 'feedback':
        return <FeedbackContent />;
      case 'rate-app':
        return <RateAppContent />;
      case 'about':
        return <AboutContent />;
      default:
        return <div className="text-blue-200/80">Content for {name}</div>;
    }
  };

  const settings: SettingItem[] = [
    // Organization Section
    {
      id: 'org-profile',
      name: 'Organization Profile',
      description: 'Manage your organization details and information',
      icon: BuildingOfficeIcon,
      onClick: () => handleSettingClick('org-profile', 'Organization Profile'),
      adminOnly: true,
    },
    {
      id: 'switch-org',
      name: 'Switch Organization',
      description: 'Change your current organization',
      icon: ArrowsRightLeftIcon,
      onClick: () => handleSettingClick('switch-org', 'Switch Organization'),
      adminOnly: true,
    },
    {
      id: 'users',
      name: 'Users',
      description: 'Manage users and their permissions',
      icon: UserGroupIcon,
      onClick: () => handleSettingClick('users', 'Users'),
      adminOnly: true,
      divider: true,
    },
    // Financial Settings
    {
      id: 'currencies',
      name: 'Currencies',
      description: 'Configure supported currencies',
      icon: CurrencyDollarIcon,
      onClick: () => handleSettingClick('currencies', 'Currencies'),
      adminOnly: true,
    },
    {
      id: 'taxes',
      name: 'Taxes',
      description: 'Set up tax rates and rules',
      icon: CalculatorIcon,
      onClick: () => handleSettingClick('taxes', 'Taxes'),
      adminOnly: true,
    },
    {
      id: 'pdf-template',
      name: 'PDF Template Customization',
      description: 'Customize invoice and report templates',
      icon: DocumentTextIcon,
      onClick: () => handleSettingClick('pdf-template', 'PDF Template Customization'),
      adminOnly: true,
    },
    {
      id: 'payment-gateways',
      name: 'Online Payment Gateways',
      description: 'Configure payment integration settings',
      icon: CreditCardIcon,
      onClick: () => handleSettingClick('payment-gateways', 'Online Payment Gateways'),
      adminOnly: true,
      divider: true,
    },
    // Security & Subscription
    {
      id: 'privacy-security',
      name: 'Privacy & Security',
      description: 'Manage privacy settings and security options',
      icon: ShieldCheckIcon,
      onClick: () => handleSettingClick('privacy-security', 'Privacy & Security'),
    },
    {
      id: 'subscription',
      name: 'Manage Subscription',
      description: 'View and manage your subscription plan',
      icon: ArrowUpCircleIcon,
      onClick: () => handleSettingClick('subscription', 'Manage Subscription'),
      adminOnly: true,
      divider: true,
    },
    // Support & About
    {
      id: 'feedback',
      name: 'Feedback',
      description: 'Share your feedback and suggestions',
      icon: ChatBubbleLeftRightIcon,
      onClick: () => handleSettingClick('feedback', 'Feedback'),
    },
    {
      id: 'rate-app',
      name: 'Rate App',
      description: 'Rate us on the app store',
      icon: StarIcon,
      onClick: () => handleSettingClick('rate-app', 'Rate App'),
    },
    {
      id: 'about',
      name: 'About',
      description: 'App version and information',
      icon: QuestionMarkCircleIcon,
      onClick: () => handleSettingClick('about', 'About'),
    },
  ];

  const filteredSettings = settings.filter(
    (setting) => !setting.adminOnly || isAdmin,
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="animate-slide-up">
        <h1 className="text-4xl font-extrabold text-gradient mb-2">
          ⚙️ Settings
        </h1>
        <p className="mt-1 text-blue-100/90 font-semibold text-lg">
          Manage your account and application preferences
        </p>
      </div>

      <div className="glass-effect rounded-2xl p-6 animate-slide-up border border-blue-400/40 shadow-2xl">
        <div className="space-y-1">
          {filteredSettings.map((setting, index) => {
            const Icon = setting.icon;
            const showDivider = setting.divider && index > 0;

            return (
              <div key={setting.id}>
                {showDivider && (
                  <div className="my-3 border-t border-blue-400/20"></div>
                )}
                <button
                  onClick={setting.onClick}
                  className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 group ${
                    selectedSetting === setting.id
                      ? 'bg-blue-500/30 border-2 border-blue-400/50 shadow-lg'
                      : 'bg-blue-600/10 hover:bg-blue-600/20 border border-blue-400/20 hover:border-blue-400/40 hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
                        selectedSetting === setting.id
                          ? 'bg-blue-500/40 text-blue-50 shadow-lg scale-110'
                          : 'bg-blue-600/30 text-blue-200 group-hover:bg-blue-500/30 group-hover:text-blue-50 group-hover:scale-110'
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-base font-bold text-blue-50">
                        {setting.name}
                      </div>
                      {setting.description && (
                        <div className="text-xs text-blue-200/70 mt-0.5">
                          {setting.description}
                        </div>
                      )}
                    </div>
                  </div>
                  <ChevronRightIcon
                    className={`h-5 w-5 transition-all duration-200 ${
                      selectedSetting === setting.id
                        ? 'text-blue-50 translate-x-1'
                        : 'text-blue-200/50 group-hover:text-blue-50 group-hover:translate-x-1'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Additional Info Card */}
      <div className="glass-effect rounded-2xl p-6 animate-slide-up border border-blue-400/40 shadow-2xl bg-gradient-to-br from-blue-600/20 to-blue-800/10">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500/40 to-blue-600/30 flex items-center justify-center shadow-xl">
            <span className="text-3xl">📦</span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-blue-50 mb-1">
              Inventory Management System
            </h3>
            <p className="text-sm text-blue-200/80">
              Comprehensive suite of tools to manage your inventory, stock, and business operations efficiently.
            </p>
          </div>
          <ChevronRightIcon className="h-6 w-6 text-blue-200/50" />
        </div>
      </div>

      {/* User Info Card */}
      <div className="glass-effect rounded-2xl p-6 animate-slide-up border border-blue-400/40 shadow-2xl">
        <h3 className="text-xl font-bold text-blue-100 mb-4">Account Information</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-blue-600/10 rounded-lg border border-blue-400/20">
            <span className="text-sm font-semibold text-blue-200/80">Current User</span>
            <span className="text-sm font-bold text-blue-50">{user?.name || 'Unknown'}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-blue-600/10 rounded-lg border border-blue-400/20">
            <span className="text-sm font-semibold text-blue-200/80">Email</span>
            <span className="text-sm font-bold text-blue-50">{user?.email || 'N/A'}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-blue-600/10 rounded-lg border border-blue-400/20">
            <span className="text-sm font-semibold text-blue-200/80">Role</span>
            <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
              isAdmin
                ? 'bg-blue-500/40 text-blue-50 border border-blue-400/40'
                : 'bg-blue-600/30 text-blue-200 border border-blue-400/30'
            }`}>
              {isAdmin ? '👑 Admin' : '👤 Staff'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-blue-600/10 rounded-lg border border-blue-400/20">
            <span className="text-sm font-semibold text-blue-200/80">Organization</span>
            <span className="text-sm font-bold text-blue-50">{organizationName || user?.organization?.name || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showModal && modalContent && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="glass-effect rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up border border-blue-400/40 relative">
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 p-2 text-blue-200 hover:bg-blue-600/30 rounded-xl transition-all hover:scale-110 border border-blue-400/40"
              title="Close"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
            
            {/* Modal Header */}
            <div className="mb-6 flex items-center space-x-4">
              <div className="w-14 h-14 rounded-xl bg-blue-500/40 flex items-center justify-center shadow-lg">
                <modalContent.icon className="h-7 w-7 text-blue-50" />
              </div>
              <div>
                <h2 className="text-3xl font-extrabold text-gradient">
                  {modalContent.title}
                </h2>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="mt-6">
              {modalContent.content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
